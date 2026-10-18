import { IExecuteFunctions, INodeExecutionData, NodeApiError } from 'n8n-workflow';
import { apiRequest, getResults, pollRunStatus } from './genericFunctions';
import { ACTOR_ID } from '../ApifyPagespeedCoreWebVitalsMonitor.node';
import { buildActorInput } from '../ApifyPagespeedCoreWebVitalsMonitor.properties';

export async function getDefaultBuild(this: IExecuteFunctions, actorId: string) {
	const defaultBuildResp = await apiRequest.call(this, {
		method: 'GET',
		uri: `/v2/acts/${actorId}/builds/default`,
	});
	if (!defaultBuildResp?.data) {
		throw new NodeApiError(this.getNode(), {
			message: `Could not fetch default build for Actor ${actorId}`,
		});
	}
	return defaultBuildResp.data;
}

export function getDefaultInputsFromBuild(build: any) {
	const buildInputProperties = build?.actorDefinition?.input?.properties;
	const defaultInput: Record<string, any> = {};
	if (buildInputProperties && typeof buildInputProperties === 'object') {
		for (const [key, property] of Object.entries(buildInputProperties)) {
			if (
				property &&
				typeof property === 'object' &&
				'prefill' in property &&
				(property as any).prefill !== undefined &&
				(property as any).prefill !== null
			) {
				defaultInput[key] = (property as any).prefill;
			}
		}
	}
	return defaultInput;
}

export async function runActorApi(
	this: IExecuteFunctions,
	actorId: string,
	mergedInput: Record<string, any>,
	qs: Record<string, any>,
) {
	return await apiRequest.call(this, {
		method: 'POST',
		uri: `/v2/acts/${actorId}/runs`,
		body: mergedInput,
		qs,
	});
}

export async function runActor(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	// Only send what the user set; the Actor applies its own schema defaults.
	// (The template merged the build's *prefill* values, which would add example URLs to every run.)
	const mergedInput = buildActorInput(this, i, {});

	const run = await runActorApi.call(this, ACTOR_ID, mergedInput, { waitForFinish: 0 });
	if (!run?.data?.id) {
		throw new NodeApiError(this.getNode(), {
			message: `Run ID not found after running the Actor`,
		});
	}

	const runId = run.data.id;
	const datasetId = run.data.defaultDatasetId;
	const lastRunData = await pollRunStatus.call(this, runId);
	if (lastRunData?.status !== 'SUCCEEDED') {
		throw new NodeApiError(this.getNode(), {
			message: `Actor run ${runId} ended with status ${lastRunData?.status}`,
			description: lastRunData?.statusMessage ?? `See https://console.apify.com/view/runs/${runId}`,
		});
	}
	const resultData = (await getResults.call(this, datasetId)) as INodeExecutionData[];
	if (!resultData.length) {
		return [{ json: { runId, status: lastRunData.status, statusMessage: lastRunData.statusMessage, datasetId, items: 0 } }];
	}
	return resultData;
}

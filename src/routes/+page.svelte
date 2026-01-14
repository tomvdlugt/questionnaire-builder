<!-- Page is split into 3 tabs
build: edit/build the questionnaire
preview: fill in questionnaire
submissions: show stored submissions -->

<script lang="ts">
	import QuestionField from '$lib/components/Question.svelte';
	import type { Question, Questionnaire, Submission } from '$lib/types';

	type PageData = {
		questionnaire: Questionnaire;
		submissions: Submission[];
	};

	export let data: PageData;

	type ActionResult = { success: true } | { success: false; error: string };

	export let form: ActionResult | null;

  // Mode decides which tab is rendered
	let mode: 'build' | 'preview' | 'submissions' = 'build';
  // Local edittable copy of the questionaire
  // Draf is seperate so that you can edit without overwriting server data
	let draft: Questionnaire = structuredClone(data.questionnaire);

  // ID generator for the questions
  // NOTE: Data.now() is 'good enough' for this demo, but would cause collisions in production
	function makeId(prefix: string) {
		return `${prefix}_${Date.now()}`;
	}

	function addTextQuestion() {
    // temp: options exist so that the ui can safely use q.options ?? [] without typescript complaining
		draft.questions = [
			...draft.questions,
			{
				id: makeId('q'),
				kind: 'text',
				label: '',
				options: []
			}
		];
	}

	function addMcQuestion() {
		draft.questions = [
			...draft.questions,
			{ id: makeId('q'), kind: 'mc', label: '', options: ['Option 1', 'Option 2'] }
		];
	}

	function removeQuestion(id: string) {
		draft.questions = draft.questions.filter((q: Question) => q.id !== id);
	}

	function addOption(qid: string) {
    // Only intended for mc questions
		draft.questions = draft.questions.map((q) =>
			q.id === qid ? { ...q, options: [...(q.options ?? []), ''] } : q
		);
	}

	function removeOption(qid: string, idx: number) {
    // only inteded for mc questions
		draft.questions = draft.questions.map((q: any) =>
			q.id === qid
				? { ...q, options: (q.options ?? []).filter((_: any, i: number) => i !== idx) }
				: q
		);
	}
</script>

<div class="mx-auto max-w-3xl p-6">
	<!-- Tabs -->
	<div class="mb-6 flex gap-2">
		<button
			type="button"
			class="rounded-md border px-3 py-2 text-sm font-semibold"
			on:click={() => (mode = 'build')}>
			Builder
		</button>

		<button
			type="button"
			class="rounded-md border px-3 py-2 text-sm font-semibold"
			on:click={() => (mode = 'preview')}>Preview</button>
		<button
			type="button"
			class="rounded-md border px-3 py-2 text-sm font-semibold"
			on:click={() => (mode = 'submissions')}
			>Submissions
		</button>
	</div>

	<!-- Status -->
	{#if form?.success === false}
		<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
			{form.error}
		</div>
	{:else if form?.success === true}
		<div class="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
			Success!
		</div>
	{/if}

	{#if mode === 'build'}
		<!-- BUILDER: posts to save -->
		<form method="POST" action="?/save">
      <!-- quick-fix solution. would safe via fetch -->
			<input type="hidden" name="draft" value={JSON.stringify(draft)} />

			<div class="space-y-12">
				<div class="border-b border-gray-900/10 pb-12">
					<h2 class="text-base/7 font-semibold text-gray-900">Builder</h2>
					<p class="mt-1 text-sm/6 text-gray-600">Edit the questionnaire and save it.</p>

					<div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
						<!-- Title -->
						<div class="col-span-full">
							<label class="block text-sm/6 font-medium text-gray-900">Title</label>
							<div class="mt-2">
								<input
									class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
									bind:value={draft.title}
								/>
							</div>
						</div>

						{#each draft.questions as q (q.id)}
							<div class="col-span-full rounded-md border p-4">
								<div class="flex items-start justify-between gap-4">
									<div class="flex-1">
										<div class="text-xs font-semibold text-gray-500">{q.kind.toUpperCase()}</div>

										<label class="mt-2 block text-sm/6 font-medium text-gray-900">Label</label>
										<div class="mt-2">
											<input
												class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
												bind:value={q.label}
												placeholder="Question label..."
											/>
										</div>
									</div>

									<button
										type="button"
										class="text-sm font-semibold text-red-600"
										on:click={() => removeQuestion(q.id)}
									>
										Remove
									</button>
								</div>

								{#if q.kind === 'mc'}
									<div class="mt-4">
										<div class="flex items-center justify-between">
											<div class="text-sm font-medium text-gray-900">Options</div>
											<button
												type="button"
												class="text-sm font-semibold"
												on:click={() => addOption(q.id)}
											>
												+ option
											</button>
										</div>

										<div class="mt-2 space-y-2">
											{#each q.options ?? [] as _opt, idx (idx)}
												<div class="flex gap-2">
													<input
														class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
														bind:value={q.options[idx]}
														placeholder={`Option ${idx + 1}`}
													/>
													<button
														type="button"
														class="text-sm font-semibold text-gray-600"
														on:click={() => removeOption(q.id, idx)}
													>
														X
													</button>
												</div>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						{/each}

						<div class="col-span-full flex gap-2">
							<button
								type="button"
								class="rounded-md border px-3 py-2 text-sm font-semibold"
								on:click={addTextQuestion}
							>
								+ Text question
							</button>

							<button
								type="button"
								class="rounded-md border px-3 py-2 text-sm font-semibold"
								on:click={addMcQuestion}
							>
								+ Multiple choice
							</button>
						</div>
					</div>
				</div>
			</div>

			<div class="mt-6 flex items-center justify-end gap-x-6">
				<button
					type="button"
					class="text-sm/6 font-semibold text-gray-900"
					on:click={() => (draft = structuredClone(data.questionnaire))}
				>
					Reset
				</button>
				<button
					type="submit"
					class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
				>
					Save questionnaire
				</button>
			</div>
		</form>
	{:else if mode === 'preview'}
    <!-- Uses the server questionnaire, not the draft
    this makes sure that uou preview the last SAVED version -->
		<form method="POST" action="?/submit">
			<div class="space-y-12">
				<div class="border-b border-gray-900/10 pb-12">
					<h2 class="text-base/7 font-semibold text-gray-900">
						{data.questionnaire.title}
					</h2>
					<p class="mt-1 text-sm/6 text-gray-600">Fill in the questions below.</p>

					<div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
						{#each data.questionnaire.questions as q (q.id)}
							<QuestionField question={q} />
						{/each}
					</div>
				</div>
			</div>

			<div class="mt-6 flex items-center justify-end gap-x-6">
				<button type="reset" class="text-sm/6 font-semibold text-gray-900">Reset</button>
				<button
					type="submit"
					class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
				>
					Submit answers
				</button>
			</div>
		</form>

		<h3 class="mt-8 text-sm font-semibold text-gray-900">Saved submissions</h3>
		<pre class="mt-2 overflow-auto rounded-md bg-gray-50 p-3 text-xs text-gray-800">
      {JSON.stringify(data.submissions, null, 2)}
    </pre>
	{:else if mode === 'submissions'}
		<h2 class="text-base/7 font-semibold text-gray-900">Submissions</h2>

		{#if data.submissions.length === 0}
			<p class="mt-2 text-sm text-gray-600">No submissions yet.</p>
		{:else}
			<div class="mt-4 space-y-4">
				{#each data.submissions as s (s.id)}
					<div class="rounded-md border p-4">
						<div class="text-sm font-semibold text-gray-900">{s.id}</div>
						<div class="text-xs text-gray-500">
							{new Date(s.createdAt).toLocaleString()}
						</div>
						<pre class="mt-2 overflow-auto rounded bg-gray-50 p-2 text-xs">
          {JSON.stringify(s.answers, null, 2)}
          </pre>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

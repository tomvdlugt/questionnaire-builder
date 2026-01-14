<script lang="ts">
  export let question;
</script>

{#if question.kind === 'text'}
						<div class="col-span-full">
							<label for={question.id} class="block text-sm/6 font-medium text-gray-900">
								{question.label}
							</label>
							<div class="mt-2">
								<input
									id={question.id}
									type="text"
									name={question.id}
									class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
								/>
							</div>
						</div>
					{:else if question.kind === 'mc'}
						<div class="col-span-full">
							<label for={question.id} class="block text-sm/6 font-medium text-gray-900">
								{question.label}
							</label>

							<div class="mt-2 grid grid-cols-1">
								<select
									id={question.id}
									name={question.id}
									class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
								>
									<option value="">-- choose --</option>

									{#each question.options ?? [] as opt}
										<option value={opt}>{opt}</option>
									{/each}
								</select>
							</div>
						</div>
					{/if}

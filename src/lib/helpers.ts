function isNonEmptyString(v: unknown): v is string {
	return typeof v === 'string' && v.trim().length > 0;
}

export function validateQuestionnaireDraft(draft: any): { ok: true; value: any } | { ok: false; error: string } {

	const ids = new Set<string>();
	const normalizedQuestions: any[] = [];

	for (const q of draft.questions) {
		if (!q || typeof q !== 'object') return { ok: false, error: 'Each question must be an object.' };

		if (!isNonEmptyString(q.id)) return { ok: false, error: 'Each question needs a non-empty id.' };
		if (ids.has(q.id)) return { ok: false, error: `Duplicate question id: ${q.id}` };
		ids.add(q.id);

		if (q.kind !== 'text' && q.kind !== 'mc') {
			return { ok: false, error: `Invalid question kind for id: ${q.id}` };
		}

		if (!isNonEmptyString(q.label)) return { ok: false, error: `Question label required for id: ${q.id}` };

		if (q.kind === 'mc') {

			const options = q.options;

			if (options.length < 2) {
				return { ok: false, error: `MC question ${q.id} needs at least 2 options.` };
			}

			normalizedQuestions.push({
				id: q.id.trim(),
				kind: 'mc',
				label: q.label.trim(),
				options
			});
		} else {
			normalizedQuestions.push({
				id: q.id.trim(),
				kind: 'text',
				label: q.label.trim(),
				options: []
			});
		}
	}

	const normalized = {
		title: draft.title.trim(),
		questions: normalizedQuestions
	};

	return { ok: true, value: normalized };
}

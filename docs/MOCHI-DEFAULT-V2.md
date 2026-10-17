# Mochi Default v2

New conversations explicitly bind `mochi_default_v2`, revision 1, using the existing blocks-v1 format. Creation accepts an explicit valid preset binding; the new-chat form offers v2 and the legacy built-in. Custom library revisions can also be applied explicitly from Presets.

Existing unbound conversations still resolve `mochi_default`, revision 1, with its original legacy-v1 assembly. Existing explicit legacy/custom/archived revision bindings are unchanged. There is no migration or rebinding on read, profile selection, or update.

The v2 built-in has four categories:

- **Core Instructions:** Base Messaging, DM-only Direct Message Behavior, group-only Group Chat Behavior.
- **Character & Persona:** authorized Character Information, saved Persona Information with enabled compatible add-ons, Character Texting Preferences.
- **Writing & Texting:** Natural Character Voice, Conversational Rhythm, Texting Preferences.
- **Conversation Context:** Room Information/instructions, verified Chat Memory, Conversation History at its history position, and enabled System Notes after history.

All exact revision-1 text and deterministic identifiers are defined in `src/mochi/default-preset.ts`. Memory stays untrusted user-role context, history retains its original roles, and notes retain their system role. Named persona outlets and era templates are not automatically inserted. Optional absent context does not fail generation. Existing block composition handles deduplication.

**Version policy:** never edit the content or identifiers of an already released built-in revision in place. Future built-in content needs a distinct identity, or a revision resolver that retains every previously bound revision. The revision-1 factory returns independent copies with fixed valid IDs. Random starter-template IDs remain appropriate for user-created drafts.

Built-ins are inspectable and immutable. **Customize Mochi Default v2** / **Duplicate / customize** saves an independent custom copy and opens an editable draft. Editing, publishing a library revision, and applying it to a conversation remain separate. Use the library selector to apply v2 or restore the legacy default intentionally; applying retains the existing pending-reply cancellation safeguards.

The preset-library and Background messaging disclosures use inherited theme colors and native keyboard-accessible expansion. Background controls retain their existing immediate-action versus Save semantics, disabled defaults, and permissions. The scheduler is unchanged.

AI Prompt Preview uses a full workspace, compact token/history/preset overview, and collapsible groups based on the actual resolved message sequence. Each message appears once in provider order, with complete expandable content and original role/placement details. Advanced contains tokenizer/model metadata, parameters, timestamps, history IDs, assumptions, and logical mappings. Actionable warnings and errors remain visible. Optional inactive memory is informational. Preview never calls a provider, publishes a preset, or applies settings.

Focused verification: `bun test tests/mochi-default-v2.test.ts tests/mochi-presets.test.ts tests/mochi-prompt-blocks.test.ts tests/mochi-persona-addons.test.ts`, followed sequentially by the memory/response/generation-errors/settings-workspace/session batch, TypeScript checking, both runtime builds, and native Pocket contracts. `scripts/check-mochi-default-v2-ui.mjs` uses an in-memory fixture at 1280, 390, and 320px; set `POCKET_PLAYWRIGHT_ROOT`, `POCKET_BROWSER_PATH`, `MOCHI_BUN`, and optionally `MOCHI_DEFAULT_OUTPUT` for an existing local toolchain. It does not install dependencies or use a real host/session/provider.

Publish matching source and both compiled bundles to `test-mochi` only. On an authorized hosted test installation, confirm its repository/branch, use Extensions → Update, then reload the browser. This assignment does not install on that host or grant owner acceptance, beta promotion, or production deployment. The real authenticated-user switching privacy gate remains unresolved.

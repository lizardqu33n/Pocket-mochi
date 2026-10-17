# Consolidated QOL acceptance regression maintenance

Acceptance starts from ce674a0. The campaign runs all tests in sequential related batches, builds separately, and uses fresh synthetic Lumiverse data/provider fixtures. Successful synthetic verification does not grant beta or owner acceptance.

## Bounded runtime repair

Profile management previously returned early on the generic busy flag during an owned active reply. This silently bypassed the already implemented consequential-navigation confirmation. Allow that specific case to reach confirmation while continuing to block unrelated pending writes. Regression coverage verifies the warning, Stay preservation, and explicitly confirmed profile-editor entry. Activating the host drawer can synchronously replace the invoking view before confirmation, and later metadata refresh can replace it again. Mochi now passes its stable workspace as the optional sheet container; native Pocket callers retain their existing container behavior. The regression delivers a pending metadata response while confirmation is open and verifies it survives. No host-authentication or backend data behavior changes.

## Existing test alignment

Older tests were updated to navigate the four settings categories and independent profile dock, retain the same draft/history/ownership checks, expect metadata-confirmed output-length diagnostics, and use actually malformed JSON in failure fixtures. Eligible single-speaker ordinary text is valid since QOL-05.

Native Pocket contracts explicitly enable Pocket Power for their synthetic arrival-injection case. Their retired phone-owned Mochi composer scenario is replaced by current account-sidebar discovery and native-phone non-mutation assertions. Independent messenger generation/history/notification/ownership coverage remains in dedicated session, workspace, sidebar and multi-user suites, plus actual synthetic browser workflows. Native Pocket contracts still run to completion against built bundles.

## Release gates

The automatic same-browser real authenticated-user A-to-B boundary remains unresolved. Direct teardown-hook tests prove disposal when invoked; they do not establish host automatic lifecycle correctness. No host-auth workaround is included. Unrestricted multi-user beta is blocked. A restricted invited preview requires separately authorized disposable real-account/browser-profile separation checks, recovery evidence and explicit owner acceptance of the residual risk. Physical Android is unperformed here and remains an owner gate. No beta promotion, production deployment or invitations are authorized.

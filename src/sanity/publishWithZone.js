import { useDocumentOperation } from 'sanity';

// Publishing records the editor's time zone, so the site can name the day of
// the edit the way the editor lived it.
export function publishWithZone(PublishAction) {
  function Action(props) {
    const { patch } = useDocumentOperation(props.id, props.type);
    const publish = PublishAction(props);
    if (!publish) return publish;
    return {
      ...publish,
      onHandle: () => {
        patch.execute([
          {
            set: {
              editedZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
          }
        ]);
        publish.onHandle();
      }
    };
  }
  Action.action = PublishAction.action;
  return Action;
}

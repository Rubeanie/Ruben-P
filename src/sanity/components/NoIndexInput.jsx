import { Button, Stack } from '@sanity/ui';
import { unset, useFormValue } from 'sanity';

// A switch stores true or false once touched; this takes a page back to
// following Site settings.
export function NoIndexInput(props) {
  const onSite = useFormValue(['_type']) === 'site';
  return (
    <Stack gap={3}>
      {props.renderDefault(props)}
      {!onSite && props.value != null && (
        <Button
          text='Follow Site settings'
          mode='ghost'
          fontSize={1}
          disabled={props.readOnly}
          onClick={() => props.onChange(unset())}
        />
      )}
    </Stack>
  );
}

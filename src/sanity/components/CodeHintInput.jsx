import { Stack, Text } from '@sanity/ui';
import { codeSchema } from '@sanity/code-input';

// A member's own input replaces the plugin's, and renderDefault would fall
// back to Sanity's plain object form, so the plugin's editor is rendered here.
const CodeEditor = codeSchema.components.input;

// The plugin's fields are fixed, so what it can't explain itself is said above it.
export function CodeHintInput(props) {
  return (
    <Stack gap={4}>
      <Text size={1} muted>
        Click a line number to highlight it. End the filename with :25 to start
        at line 25.
      </Text>
      <CodeEditor {...props} />
    </Stack>
  );
}

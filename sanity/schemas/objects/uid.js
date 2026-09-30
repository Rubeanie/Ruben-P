/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from 'react';
import { Box, Button, Flex, Text, TextInput } from '@sanity/ui';
import { MdCheck, MdContentCopy } from 'react-icons/md';

export const uid = {
  name: 'uid',
  title: 'Unique Identifier',
  description: 'Used for anchor/jump links (HTML `id` attribute).',
  type: 'string',
  validation: (Rule) => [
    Rule.regex(/^[a-zA-Z0-9-]+$/g).error(
      'Must not contain spaces or special characters'
    ),
    Rule.custom((value, { document, path }) => {
      const key = path[path.indexOf('modules') + 1]?._key;
      const taken = document?.modules?.some(
        (module) => module._key !== key && module.uid === value
      );
      return value && taken
        ? 'Another module on this page uses this id.'
        : true;
    }).warning()
  ],
  components: {
    input: ({ elementProps, path }) => {
      const indexOfModule = path.indexOf('modules');
      const moduleKey = path[indexOfModule + 1]?._key;
      const [checked, setChecked] = useState(false);

      return (
        <Flex gap={1} align='center'>
          <Text muted>#</Text>

          <Box flex={1}>
            <TextInput {...elementProps} placeholder={moduleKey} radius={2} />
          </Box>

          <Button
            title='Click to copy'
            mode='ghost'
            icon={checked ? MdCheck : MdContentCopy}
            onClick={() => {
              navigator.clipboard.writeText(
                '#' + (elementProps.value || moduleKey)
              );
              setChecked(true);
              setTimeout(() => setChecked(false), 1000);
            }}
          />
        </Flex>
      );
    }
  }
};

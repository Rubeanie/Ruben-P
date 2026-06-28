import { MdEdit } from 'react-icons/md';
import { Button, Flex, Stack, Text } from '@sanity/ui';
import ReactPlayer from 'react-player';

export const YouTubePreview = (props) => {
  const { title: url, actions } = props;
  const handleEditClick = () => {
    if (actions && typeof actions.props.onOpen === 'function') {
      actions.props.onOpen();
    }
  };
  return (
    <Stack>
      <Flex align='center' justify='center'>
        {typeof url === 'string' ? (
          <ReactPlayer src={url} />
        ) : (
          <Text>Add a YouTube URL</Text>
        )}
      </Flex>
      <Button
        fontSize={[2, 2, 3]}
        icon={MdEdit}
        mode='ghost'
        text='Edit'
        onClick={handleEditClick}
      />
    </Stack>
  );
};

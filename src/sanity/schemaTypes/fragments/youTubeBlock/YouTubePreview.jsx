import { MdEdit } from 'react-icons/md';
import { Button, Card, Flex, Stack, Text } from '@sanity/ui';
import { getYouTubeId } from '@/lib/youtube';

export const YouTubePreview = (props) => {
  const { title: url, actions } = props;
  const id = getYouTubeId(url);
  const handleEditClick = () => {
    if (actions && typeof actions.props.onOpen === 'function') {
      actions.props.onOpen();
    }
  };
  return (
    <Stack>
      <Flex align='center' justify='center'>
        {id ? (
          // The Studio document sends no referrer, and YouTube refuses embeds without one.
          <iframe
            referrerPolicy='strict-origin-when-cross-origin'
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title='YouTube preview'
            style={{ aspectRatio: '16 / 9', width: '100%', border: 0 }}
            allowFullScreen
          />
        ) : (
          // Holds the video's 16:9 so the block keeps its size before a URL goes in.
          <Card
            border
            radius={2}
            tone='transparent'
            style={{
              aspectRatio: '16 / 9',
              width: '100%',
              borderStyle: 'dashed'
            }}>
            <Flex height='fill' align='center' justify='center'>
              <Text muted size={1}>
                Add a YouTube URL
              </Text>
            </Flex>
          </Card>
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

import uid from '@/lib/uid';
import Outline from './Outline';

export default function TableOfContents({ entries, ...props }) {
  if (!entries?.length) return null;
  return <Outline id={uid(props)} entries={entries} />;
}

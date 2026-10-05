import { useEffect, useId, useState } from 'react';
import { Select, Stack, Text } from '@sanity/ui';
import { set, unset, useClient } from 'sanity';
import { apiVersion } from '@/lib/env';
import { splitParams, targetAnchors } from '@/sanity/utils';

// Refetched on focus, so headings edited on the target page show up.
function useHeadings(ref) {
  const client = useClient({ apiVersion });
  const [state, setState] = useState({});
  const [fetches, setFetches] = useState(0);
  useEffect(() => {
    if (!ref) return;
    let live = true;
    targetAnchors(client, ref, 'drafts')
      .then((target) => live && setState({ ref, target }))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [client, ref, fetches]);
  const refresh = () => setFetches((n) => n + 1);
  return [state.ref === ref ? state.target : null, refresh];
}

// Internal links offer the target page's headings under the reference;
// picking one writes #slug into the params, which stay typeable.
export function LinkInput(props) {
  const { value, onChange, readOnly, renderField } = props;
  const id = useId();
  const internal = value?.type === 'internal' && value.internal?._ref;
  const [target, refresh] = useHeadings(internal);
  const headings = target?.headings.filter((h) => h.level > 1) ?? [];
  const { query, fragment } = splitParams(value?.params);
  // A typed fragment that is no heading (a module id, say) stays selected, so
  // opening the list cannot drop it.
  const typed = fragment && !headings.some((h) => h.id === fragment);

  const pick = (event) => {
    const next = event.currentTarget.value;
    if (next) onChange(set(`${query}#${next}`, ['params']));
    else onChange(query ? set(query, ['params']) : unset(['params']));
  };

  return props.renderDefault({
    ...props,
    renderField: (field) =>
      field.name === 'internal' && headings.length > 0 ? (
        <Stack space={3}>
          {renderField(field)}
          <Stack space={2}>
            <Text as='label' htmlFor={id} size={1} weight='medium'>
              Section
            </Text>
            <Select
              id={id}
              disabled={readOnly}
              value={fragment}
              onChange={pick}
              onFocus={refresh}>
              <option value=''>Top of page</option>
              {typed && <option value={fragment}>#{fragment}</option>}
              {headings.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.level > 2 ? ` ${h.text}` : h.text}
                </option>
              ))}
            </Select>
          </Stack>
        </Stack>
      ) : (
        renderField(field)
      )
  });
}

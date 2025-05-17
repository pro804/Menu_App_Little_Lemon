import { useRef, useEffect } from 'react';
import { useCallback } from 'react';

export const SECTION_LIST_MOCK_DATA = [
    {
      title: 'Appetizers',
      data: [
        {
          id: '1',
          title: 'Pasta',
          price: '10',
        },
        {
          id: '3',
          title: 'Pizza',
          price: '8',
        },
      ],
    },
    {
      title: 'Salads',
      data: [
        {
          id: '2',
          title: 'Caesar',
          price: '2',
        },
        {
          id: '4',
          title: 'Greek',
          price: '3',
        },
      ],
    },
  ];

/**
 * 3. Implement this function to transform the raw data
 * retrieved by the getMenuItems() function inside the database.js file
 * into the data structure a SectionList component expects as its "sections" prop.
 * @see https://reactnative.dev/docs/sectionlist as a reference
 */

// this function is used to transform the data from the database into 
// the data structure a SectionList component expects

export function getSectionListData(data) {
  const sections = data.reduce((acc, menuItem) => {
    const category = menuItem.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({
      id: menuItem.id || menuItem.uuid,
      title: menuItem.title,
      price: menuItem.price,
    });
    return acc;
  }, {});

  return Object.keys(sections).map((category) => ({
    title: category,
    data: sections[category],
  }));
}

export function useUpdateEffect(effect, dependencies = []) {
  const isInitialMount = useRef(true);
  const effectCallback = useCallback(effect, dependencies);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      return effectCallback();
    }
  }, dependencies);
}

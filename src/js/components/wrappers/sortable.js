/*
 * the wrappers used for conditionally sortable content
*/

import {
  SortableHandle,
  SortableElement,
  SortableContainer,
} from 'react-sortable-hoc';

const SortableWrapper = SortableContainer(({ children }) => children);
const SortableHandler = SortableHandle(({ children }) => children);
const SortableItem = SortableElement(({ children }) => children);

export {
  SortableWrapper,
  SortableHandler,
  SortableItem,
};
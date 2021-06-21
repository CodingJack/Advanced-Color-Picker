/*
 * just a generic conditional wrapper, mostly used for potentially scrollable and sortable containers
*/
const Wrapper = ({ wrapIt, wrapper, children }) => wrapIt ? wrapper(children) : children;

export default Wrapper;
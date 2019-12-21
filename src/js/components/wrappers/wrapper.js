const Wrapper = ( { wrapIt, wrapper, children } ) => wrapIt ? wrapper( children ) : children;

export default Wrapper;
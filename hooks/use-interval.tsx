import {useEffect, useRef} from "react";

const useInterval = (callback: VoidFunction, delay: number) => {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay !== null) {
            const id = setInterval(callbackRef.current, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
};

export default useInterval;
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { action } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';

import { Store } from './store';

const Wrapper = styled.div`
    /* padding: 2em;
    display: flex;

    > * + * {
        margin-left: 2em;
    } */
`;
const MediaList = styled.ul<{width: number; height: number}>`
    margin: 0;
    padding: 0;

    display: grid;
    grid-template-columns: ${(props) => `repeat(3, ${props.width}px)`};
    grid-auto-rows: ${props => `${props.height}px`};
    grid-gap: 1em 1em;
    justify-content: center;

    li {
        list-style: none;
    }
`;

const fetchFiles = async (store: Store) => {
    const files = await (await fetch('http://localhost:3060/files')).json();

    console.log(files);

    store.setFiles(files);
};

const mediaConfig = {
    // width: 640,
    width: 480,
    height: 270,
}

export const MainView: React.FunctionComponent<{store: Store}> = observer(({store}) => {
    const [loaded, setLoaded] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            await fetchFiles(store);

            setLoaded(true);
        })();
    }, []);

    return (
        <Wrapper>
            {
                loaded
                &&
                <div>
                    <MediaList width={mediaConfig.width} height={mediaConfig.height}>
                        {
                            store.files.slice(0, 10).map(file => {
                                return (
                                    <li key={file}>
                                        <video
                                            width={mediaConfig.width}
                                            height={mediaConfig.height}
                                            controls
                                        >
                                            <source src={`http://localhost:3060/public${file}`} type="video/mp4" />
                                        </video>
                                    </li>
                                )
                            })
                        }
                    </MediaList>
                </div>
            }
        </Wrapper>
    );
});
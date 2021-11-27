import Head from 'next/head';
import ObjktView from '../../components/views/objkt-view';
import getObjktById from '../../api/get-objkt-by-id';
import getObjktsCreatedBy from '../../api/get-objkts-created-by';
import {useRouter} from 'next/router';
import {getTrimmedWallet} from '../../utilities/general';
import axios from 'axios';
import {BLOCKLIST_OBJKT} from '../../constants';
import {getBlockedTracks} from '../../api/get-blocked-lists';

export const getServerSideProps = async({params}) => {
    const {objkt} = params;
    const blockedObjkts = getBlockedTracks();
    if(blockedObjkts.data.includes(objkt)) {
        return {
            notFound: true
        };
    }
    const track = await getObjktById(objkt);
    let tracks = [];
    if(track) tracks = await getObjktsCreatedBy(track.creator.walletAddress);
    const currentTrack = tracks.find(t => t.id === Number(objkt)) || null;

    return {
        props: {
            objkt,
            tracks,
            currentTrack,
            walletAddress: track.creator.walletAddress
        }
    };
};

const PlayObjktPage = ({objkt, tracks, currentTrack, walletAddress}) => {
    const {isFallback} = useRouter();

    if(isFallback) {
        if(typeof window !== 'undefined') {
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }

        return <p>Loading...</p>;
    }

    const byName = currentTrack.creator?.name
        ? ` by ${currentTrack.creator.name}`
        : ` by ${getTrimmedWallet(walletAddress)}`;
    const title = currentTrack
        ? `Listen to ${currentTrack.title}${byName} on Hen Radio`
        : 'Not found';
    const description = currentTrack?.description
        ? `${currentTrack.description}`
        : 'An audio objkt with this id could not be found.';
    const image = 'https://hen.radio/images/hen-radio-logo-social.png';
    const url = `https://hen.radio/objkt/${objkt}`;

    return (
        <>
            <Head>
                <meta charSet="utf-8"/>
                <title>{currentTrack.title + byName} | Hen Radio | NFT Music
                                                     Player</title>
                <meta name="description" content={description}/>
                <link rel="canonical" href={`http://hen.radio/${objkt}`}/>
                <meta name="twitter:card" content="summary"/>
                <meta name="twitter:site" content="@hen_radio"/>
                <meta name="twitter:creator" content="@hen_radio"/>
                <meta name="twitter:title" content={title}/>
                <meta
                    name="twitter:description"
                    content={description}
                />
                <meta
                    name="twitter:image"
                    content={image}
                />
                <meta property="og:title" content={title}/>
                <meta property="og:url" content={url}/>
                <meta property="og:type" content="gallery"/>
                <meta
                    property="og:description"
                    content={description}
                />
                <meta
                    property="og:image"
                    content={image}
                />
                <meta httpEquiv="x-ua-compatible" content="ie=edge"/>
                <meta
                    name="viewport"
                    content="initial-scale=1.0, width=device-width"
                />
            </Head>
            <ObjktView
                walletAddress={walletAddress}
                tracks={tracks}
                currentTrack={currentTrack}
                objkt={objkt}
            />
        </>
    );
};

export default PlayObjktPage;



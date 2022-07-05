import React, { useEffect, useState } from "react";
import {
  useAddress,
  useDisconnect,
  useMetamask,
  useNFTDrop,
} from "@thirdweb-dev/react";
import { GetServerSideProps } from "next";
import { sanityclient, urlFor } from "../../sanity";
import { Collection } from "../../typings";
import Link from "next/link";
import { BigNumber } from "ethers";
import toast, { Toaster } from "react-hot-toast";

interface Props {
  collection: Collection[];
}

function NFTDrop({ collection }: Props) {
  const Collection: any = collection;
  // console.log(Collection);
  const [loading, setloading] = useState<boolean>(true);
  const [claimedsupply, setclaimedsupply] = useState<number>(0);
  const [totalsupply, settotalsupply] = useState<BigNumber>();
  const [priceInEth, setpriceInEth] = useState<string>();
  const nftdrop = useNFTDrop(Collection.address);
  const connectWithMetamask = useMetamask();
  const address = useAddress();
  const disconnect = useDisconnect();

  useEffect(() => {
    if (!nftdrop) return;
    const nftprice = async () => {
      const claimedcondition = await nftdrop.claimConditions.getAll();
      setpriceInEth(claimedcondition?.[0].currencyMetadata.displayValue);
    };

    nftprice();
  }, [nftdrop]);

  useEffect(() => {
    if (!nftdrop) return;

    const nftdropdata = async () => {
      const claimednft = await nftdrop.getAllClaimed();
      const totalnft = await nftdrop.totalSupply();

      setclaimedsupply(claimednft.length);
      settotalsupply(totalnft);

      setloading(false);
    };

    nftdropdata();
  }, [nftdrop]);

  const mintnft = async () => {
    if (!nftdrop || !address) return;
    setloading(true);
    const notification = toast.loading("Minting NFT...", {
      style: {
        background: "black",
        color: "white",
        fontSize: "1rem",
        fontWeight: "bold",
        textAlign: "center",
        padding: "1rem",
      },
    });
    const uniqueQuantity = 1; // NFT Quantity to be claimedsupply

    nftdrop
      .claimTo(address, uniqueQuantity)
      .then(async (transaction) => {
        const reciept = transaction[0].receipt;
        const claimedtokenID = transaction[0].id;
        const claimedNFT = await transaction[0].data();
        toast("Congrats... You Successfully Minted a NFT", {
          icon: "👏",
          duration: 8000,
          style: {
            background: "green",
            color: "white",
            fontSize: "1rem",
            fontWeight: "bold",
            textAlign: "center",
            padding: "1rem",
          },
        });
        // console.log(reciept);
        // console.log(claimedtokenID);
        // console.log(claimedNFT);
      })
      .catch((error) => {
        console.error(error);
        toast("Whoops... Something went wrong", {
          icon: "⚠️",
          duration: 8000,
          style: {
            background: "red",
            color: "white",
            fontSize: "1rem",
            fontWeight: "bold",
            textAlign: "center",
            padding: "1rem",
          },
        });
      })
      .finally(() => {
        setloading(false);
        toast.dismiss(notification);
      });
  };

  // console.log(collection);
  return (
    <div className="flex flex-col h-screen lg:grid lg:grid-cols-10">
      {/* LEFT */}
      <Toaster position="top-center" reverseOrder={false} />
      <div className="lg:col-span-4 bg-gradient-to-br from-cyan-600 to-red-800 items-center">
        <div className="flex flex-col items-center text-center justify-center py-2 lg:min-h-screen">
          <div className="bg-gradient-to-br from-yellow-200 to-orange-500 p-2 rounded-xl">
            <img
              className="w-44 object-cover rounded-xl lg:w-72 "
              src={urlFor(Collection.previewImage).url()}
              alt="nft"
            />
          </div>
          <div className="">
            <h1 className="text-white font-bold text-xl p-2">
              {Collection.nftcollection}
            </h1>
            <h2 className="text-white text-sm">{Collection.description}</h2>
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div className="flex flex-col lg:col-span-6 justify-between text-center">
        {/* HEADER */}
        <header className="flex items-center justify-between mx-8 mt-4">
          <Link href="/">
            <h1 className="text-gray-500 w-52 sm:w-72 cursor-pointer">
              The{" "}
              <span className="font-extrabold underline decoration-pink-600/50">
                Ground{" "}
              </span>
              for NFT Marketplace
            </h1>
          </Link>
          <button
            onClick={address ? disconnect : connectWithMetamask}
            className="hover:bg-yellow-600 rounded-full bg-yellow-500 px-4 py-1 cursor-pointer text-white text-xs lg:text-sm"
          >
            {address ? "Sign Out" : "Sign In "}
          </button>
        </header>

        {address && (
          <p className="text-green-600">
            You are logged in with Wallet{" "}
            <span className="font-bold">
              {address.substring(0, 5)}...
              {address.substring(address.length - 5)}
            </span>
          </p>
        )}
        {/* content */}
        <div className="m-4 items-center flex flex-col mt-10">
          <img
            className="w-80  object-cover shadow-sm"
            src={urlFor(Collection.mainImage).url()}
            alt="nft"
          />
          <h1 className="my-4 text-3xl font-bold lg:text-5xl lg:font-extrabold">
            {Collection.title}
          </h1>
          {loading ? (
            <p className="text-green-500 p-2">Loading supplies...</p>
          ) : (
            <p className="text-green-500 p-2">
              {claimedsupply} / {totalsupply?.toString()} NFT Claimed
            </p>
          )}
        </div>
        <button
          onClick={mintnft}
          disabled={
            !address || loading || claimedsupply == totalsupply?.toNumber()
          }
          className="bg-pink-800 px-4 py-2 mx-2 mb-4 rounded-full text-white text-lg disabled:bg-gray-400"
        >
          {loading ? (
            <>Loading</>
          ) : totalsupply?.toNumber() === claimedsupply ? (
            <>Sold Out</>
          ) : !address ? (
            <>Login to Mint</>
          ) : (
            <span> Mint NFT ({priceInEth} ETH)</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default NFTDrop;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const query = `
  *[_type == "collection" && slug.current == $id][0]{
    _id,
    title,
    address,
    description,
    nftcollection,
    mainImage{
      asset
    },
    previewImage{
      asset
    },
    slug{
      current
    },
    creator->{
      _id,
      name,
      address,
      slug{
        current
      },
    }
  }
  `;

  const collection = await sanityclient.fetch(query, {
    id: params?.id,
  });

  // console.log(params);

  if (!collection) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      collection,
    },
  };
};

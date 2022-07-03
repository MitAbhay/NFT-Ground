import React from "react";
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";
import { GetServerSideProps } from "next";
import { sanityclient, urlFor } from "../../sanity";
import { Collection } from "../../typings";
import Link from "next/link";

interface Props {
  collection: Collection[];
}

function NFTDrop({ collection }: Props) {
  const connectWithMetamask = useMetamask();
  const address = useAddress();
  const disconnect = useDisconnect();

  // console.log(collection);
  return (
    <div className="flex flex-col h-screen lg:grid lg:grid-cols-10">
      {/* LEFT */}
      <div className="lg:col-span-4 bg-gradient-to-br from-cyan-600 to-red-800 items-center">
        <div className="flex flex-col items-center text-center justify-center py-2 lg:min-h-screen">
          <div className="bg-gradient-to-br from-yellow-200 to-orange-500 p-2 rounded-xl">
            <img
              className="w-44 object-cover rounded-xl lg:w-72 "
              src={urlFor(collection.previewImage).url()}
              alt="nft"
            />
          </div>
          <div className="">
            <h1 className="text-white font-bold text-xl p-2">
              {collection.nftcollection}
            </h1>
            <h2 className="text-white text-sm">{collection.description}</h2>
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div className="flex flex-col lg:col-span-6 justify-between text-center">
        {/* HEADER */}
        <header className="flex items-center justify-between mx-8 mt-4">
          <Link href="/">
            <h1 className="text-gray-500 w-52 sm:w-72">
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
            src={urlFor(collection.mainImage).url()}
            alt="nft"
          />
          <h1 className="my-4 text-3xl font-bold lg:text-5xl lg:font-extrabold">
            {collection.title}
          </h1>
          <p className="text-green-500 p-2">13 / 25 NFT Claimed</p>
        </div>
        <button className="bg-pink-800 px-4 py-2 mx-2 mb-4 rounded-full text-white text-lg">
          Mint NFT (0.02 ETH)
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

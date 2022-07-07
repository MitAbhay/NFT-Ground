import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { sanityclient, urlFor } from "../sanity";
import { Collection } from "../typings";

interface Props {
  collections: Collection[];
}

const Home: NextPage<Props> = ({ collections }) => {
  return (
    <div className="flex min-h-screen flex-col max-w-7xl mx-auto items-center justify-center py-2 bg-gray-200">
      <Head>
        <title>NFT Ground</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="text-6xl font-bold text-red-500 p-2">
        NFT GROUND for Beginners
      </h1>
      <main className="p-10 shadow-xl">
        <div className="grid space-x-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {collections.map((collection) => (
            <Link key = {collection.title} href={`/nft/${collection.slug.current}`}>
              <div className="flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105">
                <img
                  className="h-94 w-60 object-cover rounded-2xl"
                  src={urlFor(collection.previewImage).url()}
                  alt=""
                />
                <div className="mt-2">
                  <h1 className="text-3xl">{collection.title}</h1>
                  <p className="text-sm text-gray-500 mt-2">
                    {collection.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const query = `
  *[_type == "collection"]{
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

  const collections = await sanityclient.fetch(query);

  return {
    props: {
      collections,
    },
  };
};

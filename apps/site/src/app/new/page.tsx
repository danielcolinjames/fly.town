import { GetServerSideProps, NextPage } from 'next';
import clientPromise from '../../lib/mongodb';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

interface RestaurantFirstCheckIn {
    restaurant_name: string;
    first_check_in_date: string;
}

interface LatestPageProps {
    recentFirstCheckIns: RestaurantFirstCheckIn[];
}

async function getData() {
    try {
        const client = await clientPromise;
        const db = client.db("flytown");

        const recentFirstCheckIns = await db.collection('checkins')
            .aggregate([
                {
                    $group: {
                        _id: "$restaurant_name",
                        first_check_in_date: { $min: "$created_at" }
                    }
                },
                {
                    $sort: { first_check_in_date: -1 }
                },
                {
                    $limit: 10
                },
                {
                    $project: {
                        _id: 0,
                        restaurant_name: "$_id",
                        first_check_in_date: 1
                    }
                }
            ])
            .toArray();

        return {
            recentFirstCheckIns: JSON.parse(JSON.stringify(recentFirstCheckIns)),
        };
    } catch (e) {
        console.error(e);
        return {
            props: {
                recentFirstCheckIns: [],
            },
        };
    }
}

export default async function LatestPage() {
    const { recentFirstCheckIns } = await getData()

    return (
        <main className="flex min-h-screen flex-col items-center overflow-hidden pb-40">
            <Navbar />
            <div className="flex w-full flex-col px-8">
                <div className="relative flex w-full flex-col justify-center gap-5 pt-20 md:gap-10 md:pt-32">
                    <div className='w-full md:w-auto md:max-w-5xl mx-auto'>
                        <p className="text-left text-2xl text-white md:text-5xl pb-8">
                            Newest Restaurants
                        </p>
                        <div className='flex flex-col justify-center gap-8 md:gap-4'>
                            {recentFirstCheckIns.map((checkIn: any, index: any) => (
                                <div key={index} className='flex flex-col md:flex-row justify-start gap-0 md:gap-4'>
                                    <p className="text-left text-lg text-white md:text-xl">
                                        {checkIn.restaurant_name}
                                    </p>
                                    <p className="text-left text-sm text-gray-600 md:text-xl">
                                        First check in on {new Date(checkIn.first_check_in_date).toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    )
};
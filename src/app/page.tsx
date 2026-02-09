'use client';

import { useAllCreators, useAllCreatorProfiles, useCreatorProfile, useUserActivePlan } from '@/hooks/useContractData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useState, useMemo, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { address: userAddress } = useAccount();
  const { data: creatorAddresses, isLoading: isLoadingAddresses } = useAllCreators();
  const { data: creatorProfiles, isLoading: isLoadingProfiles } = useAllCreatorProfiles(creatorAddresses as string[]);

  const [searchTerm, setSearchTerm] = useState('');

  // Synchronize mounting for hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredCreators = useMemo(() => {
    if (!creatorAddresses || !creatorProfiles) return [];

    return (creatorAddresses as string[]).map((address, index) => {
      const profileResult = creatorProfiles[index];
      const profile = profileResult.status === 'success' ? (profileResult.result as [string, bigint, bigint, boolean]) : null;
      return { address, profile };
    }).filter(({ address, profile }) => {
      // 1. Hide current user (only if mounted and connected)
      if (mounted && userAddress && address.toLowerCase() === userAddress.toLowerCase()) return false;

      // 2. Search logic
      if (!searchTerm) return true;

      const search = searchTerm.toLowerCase();
      const name = profile?.[0]?.toLowerCase() || '';
      return name.includes(search) || address.toLowerCase().includes(search);
    });
  }, [creatorAddresses, creatorProfiles, userAddress, searchTerm, mounted]);

  const isLoading = isLoadingAddresses || isLoadingProfiles;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-gray-950">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden border-b border-gray-100 dark:border-gray-900">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 tracking-tight animate-fade-in-up">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Discover Premium Content
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto animate-fade-in-up [animation-delay:200ms]">
                Support your favorite creators directly on-chain with crypto subscriptions.
                Zero intermediaries, full transparency, absolute ownership.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up [animation-delay:400ms]">
                {/* Only render account-dependent buttons after mount */}
                {mounted && !userAddress ? (
                  <div className="p-1 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95">
                    <div className="bg-white dark:bg-gray-950 rounded-[14px] p-1">
                      <ConnectButton label="Connect Wallet to Get Started" showBalance={false} chainStatus="none" />
                    </div>
                  </div>
                ) : (
                  <a href="#explore" className="text-blue-600 font-semibold hover:underline flex items-center gap-2 group transition-transform hover:translate-x-1">
                    Browse Creators
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-y-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 pointer-events-none opacity-30 dark:opacity-20">
            <div className="absolute top-10 right-20 w-96 h-96 bg-blue-500 rounded-full blur-[120px] animate-float" />
            <div className="absolute bottom-10 left-20 w-96 h-96 bg-purple-500 rounded-full blur-[120px] animate-float [animation-delay:2s]" />
          </div>
        </section>

        {/* Discovery Section */}
        <section id="explore" className="container mx-auto py-16 px-4 scroll-mt-16 animate-fade-in-up [animation-delay:600ms]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Explore Creators</h2>
              <p className="text-gray-500">Find the best minds in the ecosystem</p>
            </div>

            {/* Search Bar - Moved to right side with button */}
            <div className="max-w-xl w-full md:w-auto flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Search by name or address (0x...)"
                  className="pl-10 h-12 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all border-gray-200 dark:border-gray-800 w-full hover:border-blue-300 dark:hover:border-blue-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-3.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <Button className="h-12 px-8 shadow-md hover:shadow-lg transition-all active:scale-95">
                Search
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-20">
              <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : filteredCreators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCreators.map(({ address }, index) => (
                <div key={address} className="animate-fade-in-up" style={{ animationDelay: `${(index + 2) * 100}ms` }}>
                  <CreatorCard address={address} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 border-2 border-dashed rounded-[2rem] border-gray-100 dark:border-gray-900 bg-gray-50/30 dark:bg-gray-900/10 transition-all">
              <p className="text-gray-400 text-xl font-medium">
                {searchTerm ? "No creators found matching your search." : "No creators discovered yet."}
              </p>
              {searchTerm && (
                <Button variant="ghost" className="mt-4" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function CreatorCard({ address }: { address: string }) {
  const { address: userAddress } = useAccount();
  const { data: profile } = useCreatorProfile(address);
  const { data: activePlanIdResult } = useUserActivePlan(userAddress, address);

  const activePlanId = activePlanIdResult ? Number(activePlanIdResult) : 0;
  const isSubscribed = activePlanId > 0;

  if (!profile) return <Card className="h-64 animate-pulse bg-gray-50 dark:bg-gray-900 border-none shadow-sm" />;

  const [name, _, subscribers] = profile as [string, bigint, bigint];

  return (
    <Card className={`group relative hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${isSubscribed
        ? 'border-blue-500 ring-2 ring-blue-500/20 dark:border-blue-400'
        : 'border-gray-100 dark:border-gray-800'
      } overflow-hidden px-5 py-6 bg-white dark:bg-gray-900/50 backdrop-blur-sm hover:border-blue-500/50`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Subscription Badge */}
      {isSubscribed && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Subscribed
          </div>
        </div>
      )}

      <CardHeader className="px-0 relative z-10">
        <CardTitle className=" text-2xl font-bold group-hover:text-blue-600 transition-colors">
          {name || 'Unnamed Creator'}
        </CardTitle>
        <p className="text-xs font-mono text-gray-400 truncate mt-1">{address}</p>
      </CardHeader>
      <CardContent className="px-0 relative z-10">
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50 dark:border-gray-800">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{Number(subscribers)}</span>
            <span className="text-xs text-gray-400 uppercase tracking-widest">Subscribers</span>
          </div>
          <Link href={`/creator/${address}`}>
            <Button variant="outline" className={`rounded-xl ${isSubscribed
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-gray-200 dark:border-gray-800'
              } group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shadow-sm`}>
              {isSubscribed ? 'View Subscription' : 'Explore Profile'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

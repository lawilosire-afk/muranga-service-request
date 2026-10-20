import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './context/useAuth';
import { AuthPage } from './pages/AuthPage';
import { supabase } from './services/supabase';
import type {
  ServiceRequest,
  RequestCategory,
  RequestStatus,
} from './types';
import { SubmitRequestModal } from './components/SubmitRequestModal';
import {
  LogOut,
  FileText,
  PlusCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';

const CATEGORIES: (RequestCategory | 'All')[] = [
  'All',
  'Water and sanitation',
  'Roads and drainage',
  'Street lighting',
  'Garbage collection',
  'Public facilities',
  'Other',
];

const STATUSES: (RequestStatus | 'All')[] = [
  'All',
  'Pending',
  'In Progress',
  'Resolved',
];

export default function App() {
 const { user, profile, loading, passwordRecovery, signOut } = useAuth();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchingRequests, setFetchingRequests] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<RequestCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] =
    useState<RequestStatus | 'All'>('All');
  const [requestError, setRequestError] = useState<string | null>(null);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(
    null,
  );

  const fetchRequests = useCallback(async () => {
    if (!user) {
      setRequests([]);
      return;
    }

    setFetchingRequests(true);
    setRequestError(null);

    try {
      let query = supabase
        .from('service_requests')
        .select('*, profiles(full_name, email)');

      if (profile?.role === 'citizen') {
        query = query.eq('citizen_id', user.id);
      }

      const { data, error } = await query.order('created_at', {
        ascending: false,
      });

      if (error) {
        throw error;
      }

      setRequests((data ?? []) as ServiceRequest[]);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while loading requests.';

      console.error('Error fetching requests:', message);
      setRequestError(message);
    } finally {
      setFetchingRequests(false);
    }
  }, [user, profile]);

 useEffect(() => {
  if (!user) {
    return;
  }

  const load = async () => {
    await fetchRequests();
  };

  void load();
}, [user, fetchRequests]);
  const handleUpdateStatus = async (
    requestId: string,
    newStatus: RequestStatus,
  ) => {
    if (profile?.role !== 'admin') {
      setRequestError('Only authorised administrators can update requests.');
      return;
    }

    setUpdatingRequestId(requestId);
    setRequestError(null);

    try {
      const updateData: {
        status: RequestStatus;
        updated_at: string;
        resolved_at?: string | null;
      } = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'Resolved') {
        updateData.resolved_at = new Date().toISOString();
      } else {
        updateData.resolved_at = null;
      }

      const { error } = await supabase
        .from('service_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      await fetchRequests();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to update the request status.';

      console.error('Error updating status:', message);
      setRequestError(message);
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const term = searchTerm.trim().toLowerCase();

    const matchesSearch =
      request.reference_number.toLowerCase().includes(term) ||
      request.location.toLowerCase().includes(term) ||
      request.description.toLowerCase().includes(term) ||
      (request.profiles?.full_name?.toLowerCase().includes(term) ?? false);

    const matchesCategory =
      selectedCategory === 'All' || request.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'All' || request.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalCount = requests.length;
  const pendingCount = requests.filter(
    (request) => request.status === 'Pending',
  ).length;
  const inProgressCount = requests.filter(
    (request) => request.status === 'In Progress',
  ).length;
  const resolvedCount = requests.filter(
    (request) => request.status === 'Resolved',
  ).length;
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-county-green mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">
            Loading Murang&apos;a County Portal...
          </p>
        </div>
      </div>
    );
  }

  const isPasswordRecovery =
    window.location.hash.includes('type=recovery');

  if (isPasswordRecovery) {
    return <AuthPage />;
  }
if (passwordRecovery) {
  return <AuthPage />;
}

if (!user) {
  return <AuthPage />;
}

  const isNewUser =
    profile?.created_at != null &&
    new Date().getTime() - new Date(profile.created_at).getTime() <
      5 * 60 * 1000;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-county-green shadow-md text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/muranga-logo.png"
              alt="Murang'a County Logo"
              className="w-10 h-10 object-contain bg-white rounded-full p-0.5 shadow"
            />

            <div>
              <h1 className="font-bold text-lg leading-tight">
                Murang&apos;a County
              </h1>
              <p className="text-xs text-green-100">
                Public Service Request System
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">
                {profile?.full_name || user.email}
              </p>
              <span className="text-xs bg-county-accent text-gray-900 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                {profile?.role || 'Citizen'}
              </span>
            </div>

            <button
              onClick={() => void signOut()}
              className="flex items-center gap-1 bg-green-900 hover:bg-green-950 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-white overflow-hidden shadow rounded-lg border-l-4 border-county-green flex flex-col sm:flex-row justify-between items-start sm:items-center p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isNewUser
                ? `Welcome, ${profile?.full_name || 'Citizen'}!`
                : `Welcome back, ${profile?.full_name || 'Citizen'}!`}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {profile?.role === 'admin'
                ? 'County Official Dashboard: Review, filter, update, and manage all citizen service requests.'
                : 'Submit new public service requests and track their resolution status.'}
            </p>
          </div>

          {profile?.role === 'citizen' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-county-green text-white px-4 py-2 rounded-md shadow hover:bg-county-dark transition-colors font-medium text-sm"
            >
              <PlusCircle className="w-5 h-5" />
              Lodge New Ticket
            </button>
          )}
        </div>

        {profile?.role === 'admin' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setSelectedStatus('All')}
              className={`text-left bg-white p-5 rounded-lg shadow border cursor-pointer transition-all hover:shadow-md ${
                selectedStatus === 'All'
                  ? 'border-county-green ring-2 ring-county-green/20'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Tickets
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalCount}
                  </p>
                </div>
                <div className="p-3 bg-green-50 text-county-green rounded-full">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Click to show all tickets
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('Pending')}
              className={`text-left bg-white p-5 rounded-lg shadow border cursor-pointer transition-all hover:shadow-md ${
                selectedStatus === 'Pending'
                  ? 'border-gray-500 ring-2 ring-gray-400/20'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Pending / Open
                  </p>
                  <p className="text-2xl font-bold text-gray-700 mt-1">
                    {pendingCount}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 text-gray-600 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Click to filter pending cases
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('In Progress')}
              className={`text-left bg-white p-5 rounded-lg shadow border cursor-pointer transition-all hover:shadow-md ${
                selectedStatus === 'In Progress'
                  ? 'border-yellow-500 ring-2 ring-yellow-400/20'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    {inProgressCount}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Click to filter in-progress cases
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('Resolved')}
              className={`text-left bg-white p-5 rounded-lg shadow border cursor-pointer transition-all hover:shadow-md ${
                selectedStatus === 'Resolved'
                  ? 'border-green-500 ring-2 ring-green-400/20'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Resolved Cases
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {resolvedCount}
                  </p>
                </div>
                <div className="p-3 bg-green-50 text-green-600 rounded-full">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Click to filter resolved cases
              </p>
            </button>
          </div>
        )}

        <section className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="relative w-full lg:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                aria-label="Search service requests"
                placeholder="Search ref #, location, text..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-county-green focus:border-county-green"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <Filter className="w-4 h-4 text-gray-400" />
                <label htmlFor="category-filter">Category:</label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(
                      event.target.value as RequestCategory | 'All',
                    )
                  }
                  className="text-xs border border-gray-300 rounded-md py-1.5 px-2 bg-white focus:ring-county-green focus:border-county-green"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <label htmlFor="status-filter">Status:</label>
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(event.target.value as RequestStatus | 'All')
                  }
                  className="text-xs border border-gray-300 rounded-md py-1.5 px-2 bg-white focus:ring-county-green focus:border-county-green"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => void fetchRequests()}
                disabled={fetchingRequests}
                className="p-1.5 text-gray-500 hover:text-county-green border border-gray-300 rounded-md bg-white hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Refresh Requests"
                aria-label="Refresh requests"
              >
                <RefreshCw
                  className={`w-4 h-4 ${fetchingRequests ? 'animate-spin' : ''}`}
                />
              </button>
            </div>
          </div>

          {requestError && (
            <div
              role="alert"
              className="m-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              <p>{requestError}</p>
              <button
                type="button"
                onClick={() => void fetchRequests()}
                className="mt-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          <div className="px-6 py-3 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2 bg-white">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-county-green" />
              {profile?.role === 'admin'
                ? 'All County Service Requests'
                : 'My Service Requests'}
            </h2>
            <span className="text-xs bg-green-100 text-county-green font-semibold px-2.5 py-1 rounded-full">
              Showing {filteredRequests.length} of {requests.length} Tickets
            </span>
          </div>

          {fetchingRequests ? (
            <div className="p-8 text-center text-gray-500">
              Loading requests...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No matching service requests
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ref #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category &amp; Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    {profile?.role === 'admin' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Citizen
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    {profile?.role === 'admin' && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-county-green">
                        {request.reference_number}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {request.category}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {request.description}
                        </div>

                        {request.image_path && (
                          <a
                            href={
                              supabase.storage
                                .from('service-images')
                                .getPublicUrl(request.image_path).data.publicUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center text-xs text-county-green hover:underline font-medium"
                          >
                            View Attached Photo
                          </a>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{request.location}</span>
                        </div>
                      </td>

                      {profile?.role === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="font-medium text-gray-900">
                            {request.profiles?.full_name || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {request.profiles?.email}
                          </div>
                        </td>
                      )}

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            request.status === 'Resolved'
                              ? 'bg-green-100 text-green-800'
                              : request.status === 'In Progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {request.status === 'Resolved' ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : request.status === 'In Progress' ? (
                            <Clock className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          {request.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>

                      {profile?.role === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <select
                            aria-label={`Update status for ${request.reference_number}`}
                            value={request.status}
                            disabled={updatingRequestId === request.id}
                            onChange={(event) =>
                              void handleUpdateStatus(
                                request.id,
                                event.target.value as RequestStatus,
                              )
                            }
                            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:ring-county-green focus:border-county-green disabled:opacity-50"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {profile?.role === 'citizen' && (
        <SubmitRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => void fetchRequests()}
          userId={user.id}
        />
      )}

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        Murang&apos;a County Government &copy; {new Date().getFullYear()} —
        Public Service Request System
      </footer>
    </div>
  );
}
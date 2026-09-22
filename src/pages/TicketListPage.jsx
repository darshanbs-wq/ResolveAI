import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { listTickets } from '../api/tickets'
import { useState, } from 'react'
import { useQuery } from '@tanstack/react-query'




export default function TicketListPage() {
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()

    // const [tickets, setTickets] = useState([])
    // const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')
    const FILTERS = [
        { id: 'all', label: 'All' },
        { id: 'open', label: 'Open' },
        { id: 'in_progress', label: 'In Progress' },
        { id: 'resolved', label: 'Resolved' },
    ]
    const PRIORITY_STYLES = {
        high: 'rounded-lg px-3 py-1.5 text-sm font-medium transition bg-red-50 text-red-700 ring-1 ring-inset ring-red-100 dark:bg-red-950/60 dark:text-red-300 dark:ring-red-900',
        medium: 'rounded-lg px-3 py-1.5 text-sm font-medium transition bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900',
        low: 'rounded-lg px-3 py-1.5 text-sm font-medium transition bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900',
    }
    const STATUS_STYLES = {
        all: 'rounded-lg px-3 py-1.5 text-sm font-medium transition bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
        open: 'rounded-lg px-3 py-1.5 text-sm font-medium transition bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-100 hover:bg-slate-50 hover:text-ink dark:bg-teal-950/60 dark:text-teal-300 dark:ring-teal-900 dark:hover:bg-slate-800 dark:hover:text-slate-100',
        in_progress: 'rounded-lg px-3 py-1.5 text-sm font-medium transition bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-100 hover:bg-slate-50 hover:text-ink dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900 dark:hover:bg-slate-800 dark:hover:text-slate-100',
        resolved: 'rounded-lg px-3 py-1.5 text-sm font-medium transition bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:text-ink dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-100',
    }
    const BADGE_STYLES = {
        open: 'bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-100 dark:bg-teal-950/60 dark:text-teal-300 dark:ring-teal-900',
        in_progress: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900',
        resolved: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
    }

    const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
        queryKey: ['tickets', statusFilter],
        queryFn: () => listTickets({ status: statusFilter }),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    })

   

    const visibleTickets = data ?? []

    // useEffect(() => {
    //     async function load() {
    //         const data = await listTickets()
    //         setTickets(data)
    //         setLoading(false)

    //     }
    //     load()


    // }, [])

    return (
        <>

            <div className='min-h-screen animate-fade-in bg-canvas text-ink dark:bg-slate-950 dark:text-slate-100'>
                <div className=' flex justify-between items-center bg-[#0F766E] text-white p-4 border-b border-slate-100 dark:bg-teal-950 dark:border-slate-800'>
                    <p className='text- font-bold'>Welcome, {user.email}</p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            className="rounded-md bg-white/15 px-3 py-2 text-sm font-medium text-white hover:bg-white/25"
                        >
                            {theme === 'dark' ? 'Light' : 'Dark'}
                        </button>
                        <button onClick={() => {
                            logout()
                            navigate("/login")
                        }} className='bg-white text-black px-4 py-2 rounded-md dark:bg-slate-800 dark:text-slate-100'>Logout</button>
                    </div>
                </div>


                <div className='flex justify-between items-center flex-wrap gap-3 border-b border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900'>
                    <h1 className='font-display text-xl font-semibold text-ink dark:text-slate-100' >Inbox</h1>
                    <p className="mt-0.5 text-xs text-muted dark:text-slate-400">
                        {isFetching && !isLoading ? '⟳ Refreshing…' : 'Triaging customer tickets'}
                    </p>
                    <Link to="/tickets/new" className='rounded-lg bg-brand-dark px-4 py-2 text-sm text-white hover:bg-brand-dark/80 transition-colors dark:bg-teal-700 dark:hover:bg-teal-600'>New Ticket</Link>
                </div>


                <div className=' flex  flex-wrap gap-3 border-b border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900'>
                    {FILTERS.map((filter) => {
                        const selected = statusFilter === filter.id
                        return (
                            <button
                                key={filter.id}
                                type="button"
                                onClick={() => setStatusFilter(filter.id)}
                                className={`rounded-full px-3 py-1 text-sm font-medium transition ${selected
                                        ? `${STATUS_STYLES[filter.id]} opacity-100 shadow-sm ring-2 ring-brand/30 scale-[1.1]`
                                        : 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200 opacity-60 hover:opacity-100 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        )
                    })}
                </div>
                <div className='bg-white dark:bg-slate-900'>
                    {isLoading && (<div>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="px-6 py-4">
                                <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                                <div className="mb-2 h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                            </div>
                        ))}
                    </div>)}
                    {!isLoading && visibleTickets.length === 0 && <p className="px-6 py-8 text-sm text-muted dark:text-slate-400"> No tickets found</p>}
                    {isError && <div className="px-6 py-8 text-sm text-red-600 dark:text-red-400">
                        <p>Error: {error?.message}</p>
                        <button onClick={() => refetch()} className="rounded-md bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-950">
                            Try again
                        </button>
                    </div>}
                    {!isLoading && visibleTickets.map((ticket, i) => {
                        return (<Link key={ticket.id} to={`/tickets/${ticket.id}`}
                            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                            className='block animate-fade-up border-b border-slate-200 px-6 py-4 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:hover:bg-slate-800/70'>
                            <div className='flex items-start justify-between gap-3'>
                                <div className='min-w-0'>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-xs text-muted dark:text-slate-400'>#{ticket.id}</span>
                                        <h2 className='truncate text-sm font-semibold text-ink dark:text-slate-100'>{ticket.title}</h2>
                                    </div>

                                    <p className='mt-1 line-clamp-1 text-sm text-muted dark:text-slate-400'>{ticket.body}</p>
                                    <div className='mt-2 flex items-center gap-2'>
                                        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${BADGE_STYLES[ticket.status]} ${statusFilter === ticket.status
                                            ? 'opacity-100 shadow-sm scale-105'
                                            : 'opacity-60 hover:opacity-100'
                                            }`}> {ticket.status.replace('_', ' ')}</span>
                                        <span className="text-xs text-muted dark:text-slate-500">·</span>
                                        <span className="text-xs text-muted dark:text-slate-400">{ticket.category}</span>
                                    </div>
                                </div>
                                <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[ticket.priority]}`}>
                                    {ticket.priority}
                                </span>

                                {/* <p>Status:{ticket.status}</p>
                            <p>Priority:{ticket.priority}</p>
                            <p>Category:{ticket.category}</p> */}

                            </div>
                        </Link>
                        )
                    })}
                </div>
                {!isLoading && !isError && visibleTickets.length > 0 && (
                    <div className="border-t border-slate-100 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-muted dark:text-slate-400">
                            {visibleTickets.length} ticket{visibleTickets.length !== 1 ? 's' : ''}
                            {statusFilter !== 'all' ? ` · ${statusFilter.replace('_', ' ')}` : ''}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
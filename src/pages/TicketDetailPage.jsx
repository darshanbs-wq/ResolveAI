import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTicket, updateTicket } from '../api/tickets'
import { useState, useEffect, useRef } from 'react'
import { runAssist } from '../api/assist'

const STATUS_STYLES = {
    open: 'bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-100 dark:bg-teal-950/60 dark:text-teal-300 dark:ring-teal-900',
    in_progress: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900',
    resolved: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
}

const PRIORITY_STYLES = {
    high: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-100 dark:bg-red-950/60 dark:text-red-300 dark:ring-red-900',
    medium: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900',
    low: 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900',
}


export default function TicketDetailPage() {
    const { id } = useParams()
    

    const { data: ticket, isLoading, isError, error } = useQuery({
        queryKey: ['ticket', id],
        queryFn: () => getTicket(id),
        enabled: Boolean(id),

    })
    const queryClient = useQueryClient()
    const [status, setStatus] = useState('')
    const [reply, setReply] = useState('')
    const replyActionLock = useRef(false)
    const assist = useMutation({
        mutationFn: async (action) => { return runAssist(action, ticket) }

    })

    useEffect(() => {

        if (ticket) setStatus(ticket.status)
       
    }, [ticket])

    useEffect(() => {
        if (ticket) setReply(ticket.draftReply ?? '')
    }, [ticket?.id])

    const updateStatus = useMutation({
        mutationFn: (nextStatus) => updateTicket(id, { status: nextStatus }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', id] })
            queryClient.invalidateQueries({ queryKey: ['tickets'] })
        },
    })
    const updateDraftReply = useMutation({
        mutationFn: (draftReply) => updateTicket(id, { draftReply }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', id] })
            queryClient.invalidateQueries({ queryKey: ['tickets'] })
        },
        onSettled: () => {
            replyActionLock.current = false
        },
    })

    const applytriage = useMutation({
        mutationFn: async (triage) => updateTicket(id, { priority: triage.priority, category: triage.category }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', id] })
            queryClient.invalidateQueries({ queryKey: ['tickets'] })
        },
        onError: (error) => {
            console.error('Error applying triage:', error)
        }

    })

    const sendAndResolve = useMutation({
        mutationFn: (agentReply) => updateTicket(id, { status: 'resolved', agentReply, draftReply: '' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', id] })
            queryClient.invalidateQueries({ queryKey: ['tickets'] })
            setReply('')
            setStatus('resolved')
        },
        onSettled: () => {
            replyActionLock.current = false
        },
    })

    if (isLoading) return (
        <div className='min-h-screen space-y-2 bg-canvas p-6 dark:bg-slate-950'>
            <div className='h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700' />
            <div className='h-3 w-full animate-pulse rounded bg-slate-300 dark:bg-slate-800' />
            <div className='h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-700' />

        </div>
    )
    if (isError || !ticket) return (
        <div className="min-h-screen bg-canvas p-6 flex flex-col items-center justify-center dark:bg-slate-950">
            <div className='flex flex-col items-center justify-center'>
                <p className="text-sm text-red-600">{error?.message || 'Ticket not found'}</p>
                <Link to="/tickets" className="mt-2 inline-block text-sm text-brand underline">
                    Back to inbox
                </Link>
            </div>
            
        </div>
    )

    return (
        <div className='min-h-screen bg-canvas p-6 text-ink dark:bg-slate-950 dark:text-slate-100'>
            <div className='flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900'>
                <Link to="/tickets" className="text-sm font-medium text-muted transition-colors hover:text-ink dark:text-slate-400 dark:hover:text-slate-100">
                    ← Inbox
                </Link>
                <div className='flex items-center gap-2'>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[ticket.status]}`}>
                        {ticket.status.replace('_', ' ')}
                    </span>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[ticket.priority]}`}>
                        {ticket.priority}
                    </span>

                </div>

            </div>

            {/* <h1>Ticket Detail</h1> */}
            <div className='mx-auto flex max-w-[1200px] flex-col gap-6 p-6 lg:flex-row'>
                <div className='min-w-0 flex-1 space-y-4'>
                    <div className='rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm'>
                        <p className="text-xs text-muted dark:text-slate-400">#{ticket.id}</p>
                        <h1 className='mt-1 font-display text-xl font-semibold text-ink dark:text-slate-100'>
                            {ticket.title}
                        </h1>
                        <dl className='mt-3 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3'>
                            {ticket.customerName && (
                                <div className='flex gap-2 text-sm'>
                                    <dt className='w-24 shrink-0 text-xs uppercase tracking-wide text-muted dark:text-slate-400'>Customer</dt>
                                    <dd className='text-ink dark:text-slate-100'>{ticket.customerName}</dd>
                                </div>
                            )}
                            {ticket.customerEmail && (
                                <div className='flex gap-2 text-sm'>
                                    <dt className='w-24 shrink-0 text-xs uppercase tracking-wide text-muted dark:text-slate-400'>Email</dt>
                                    <dd className='truncate text-ink dark:text-slate-100'>{ticket.customerEmail}</dd>
                                </div>
                            )}
                            <div className='flex gap-2 text-sm'>
                                <dt className='w-24 shrink-0 text-xs uppercase tracking-wide text-muted dark:text-slate-400'>Category</dt>
                                <dd className='text-ink dark:text-slate-100'>{ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1).toLowerCase()}</dd>
                            </div>
                            <div className='flex gap-2 text-sm'>
                                <dt className='w-24 shrink-0 text-xs uppercase tracking-wide text-muted dark:text-slate-400'>Status</dt>
                                <dd className='text-ink dark:text-slate-100'>{ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).toLowerCase().replace('_', ' ')}</dd>
                            </div>
                            <div className='flex gap-2 text-sm'>
                                <dt className='w-24 shrink-0 text-xs uppercase tracking-wide text-muted dark:text-slate-400'>Priority</dt>
                                <dd className='text-ink dark:text-slate-100'>{ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1).toLowerCase()}</dd>
                            </div>
                        </dl>

                    </div>


                    <div className='rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm flex-shrink-0'>
                        <h2 className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted dark:text-slate-400'>
                            Customer message
                        </h2>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-ink dark:text-slate-100">{ticket.body}</p>
                    </div>

                    {ticket.agentReply && (
                    <div className='rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm'>
                        <h2 className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted dark:text-slate-400'>
                            Agent reply
                        </h2>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-ink dark:text-slate-100">{ticket.agentReply}</p>
                    </div>
                    )}

                    <div className='rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm'>
                        <h2 className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted dark:text-slate-400'>
                            Update Status
                        </h2>
                        <div className='flex items-center gap-3'>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink transition focus:border-brand focus:ring-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'>
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                            <button type='button' onClick={() => updateStatus.mutate(status)} disabled={updateStatus.isPending} className='rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60'>{updateStatus.isPending ? 'Saving...' : 'Save Status'}</button>
                            {updateStatus.isSuccess && (
                                <span className="text-xs text-brand">✓ Saved</span>
                            )}
                        </div>
                    </div>

                    <div className='rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm'>
                        <h2 className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted dark:text-slate-400'>
                            Reply to customer
                        </h2>
                        <textarea value={reply} onChange={(e) => setReply(e.target.value) } placeholder="Write a reply to the customer…" rows="4" cols="50" className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink transition focus:border-brand focus:ring-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'></textarea>
                        <div className='mt-4 flex flex-col items-end justify-end gap-2'>
                            <button
                                type="button"
                                onClick={() => {
                                    if (replyActionLock.current) return
                                    replyActionLock.current = true
                                    sendAndResolve.mutate(reply.trim())
                                }}
                                disabled={!reply.trim() || sendAndResolve.isPending || updateDraftReply.isPending}
                                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
                            >
                                {sendAndResolve.isPending ? 'Sending...' : 'Send & resolve'}
                            </button>
                            
                            <button
                                type="button"
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (replyActionLock.current) return
                                    replyActionLock.current = true
                                    updateDraftReply.mutate(reply.trim())
                                }}
                                disabled={updateDraftReply.isPending || sendAndResolve.isPending}
                            >
                                {updateDraftReply.isPending ? 'Saving...' : 'Save draft'}
                            </button>
                            {updateDraftReply.isSuccess && <span className="text-xs text-brand">✓ Draft saved</span>}
                            {updateDraftReply.isError && <span className="text-xs text-red-600">{updateDraftReply.error.message}</span>}
                        </div>
                    </div>
                </div>

                <div className='w-full shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm lg:w-[300px] h-auto overflow-y-auto '>
                    <div className='border-b border-slate-200 p-5 dark:border-slate-800'>
                        <h2 className='font-display text-base font-semibold text-brand-dark dark:text-teal-300'>
                            ✨ AI Assist
                        </h2>
                        <p className="mt-1 text-xs text-muted dark:text-slate-400">
                            Summarize, triage, or draft a reply
                        </p>

                    </div>

                    <div className='flex flex-wrap gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800'>
                    <button type="button" onClick={() => assist.mutate('summarize')} disabled={assist.isPending} className='rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50'> Summarize</button>
                    <button type="button" onClick={() => assist.mutate('triage')} disabled={assist.isPending} className='rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50'>Triage</button>
                    <button type="button" onClick={() => assist.mutate('draft')} disabled={assist.isPending} className='rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50'>Draft</button>

                    </div>

                    <div className='min-h-[120px] px-4 py-4'>
                        {assist.isPending && (
                            <div className='space-y-2'>
                                <div className="h-3 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                                <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                                <div className="h-3 w-4/6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />

                                <p className="mt-2 text-xs text-muted dark:text-slate-400">Thinking…</p>

                            </div>

                        )}

                        {assist.isError && (
                            <div className='space-y-2'>
                                <div className="h-3 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

                                <p className="mt-2 text-xs text-red-600">Error: {assist.error?.message}</p>
                            </div>
                        )}

                        {!assist.isPending && !assist.data && !assist.isError && (
                            <p className="text-sm text-muted dark:text-slate-400">
                                Pick an action above. Results appear here.
                            </p>
                        )}

                        {assist.data?.type === 'summary' &&(
                            <div className='space-y-2'>
                                <h3 className='text-xs font-semibold uppercase tracking-wide text-muted dark:text-slate-400'>
                                    Summary
                                </h3>
                                <ul className='list-disc space-y-1 pl-5'>
                                    {/* {assist.data.bullets.map((line)=>{
                                        const colon = line.indexOf(':')
                                        const label = colon === -1 ? line : line.slice(0, colon)
                                        const value = colon === -1 ? '' : line.slice(colon + 1)
                                        return (
                                        <li key={line} className='text-sm text-ink dark:text-slate-100'>
                                            <span className='font-semibold'>{label}:</span>{value}
                                        </li>
                                        )
                                    })} */}

                                    {assist.data.bullets.map((line)=>{
                                        const colon = line.indexOf(':')
                                        if (colon === -1){
                                            return <li key={line} className='text-sm text-ink dark:text-slate-100'>{line}</li>
                                        }
                                        const label = line.slice(0, colon).trim()
                                        const value = line.slice(colon + 1).trim()
                                        return <li key={line} className='text-sm text-ink dark:text-slate-100'> <span className='font-semibold'>{label}:</span> {value}</li>    
                                    })} 
                               
                                </ul>
                            </div>
                        )}

                        {assist.data?.type === 'triage' &&(
                            <div className='space-y-2'>
                                <h3 className='text-xs font-semibold uppercase tracking-wide text-muted dark:text-slate-400'>
                                    Triage
                                </h3>
                                <dl className='space-y-1'>
                                    <div className='flex gap-2 text-sm'>
                                        <dt className='w-20 shrink-0 text-xs uppercase tracking-wide text-muted dark:text-slate-400'>Priority</dt>
                                        <dd className='font-semibold text-ink dark:text-slate-100'>{assist.data.priority}</dd>
                                    </div>
                                    <div className='flex gap-2 text-sm'>
                                        <dt className='w-20 shrink-0 text-xs uppercase tracking-wide text-muted dark:text-slate-400'>Category</dt>
                                        <dd className='font-semibold text-ink dark:text-slate-100'>{assist.data.category}</dd>
                                    </div>
                                </dl>
                               <div className='mt-2 flex justify-end gap-2'> <button type="button" onClick={() => applytriage.mutate(assist.data)} disabled={applytriage.isPending} className='rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50'>Apply Triage</button></div>
                            </div>
                        )}
                        {assist.data?.type === 'draft' &&(
                            <div className='space-y-2'>
                                <h3 className='text-xs font-semibold uppercase tracking-wide text-muted dark:text-slate-400'>
                                    Draft
                                </h3>
                                <div className='space-y-1 text-sm leading-relaxed text-ink dark:text-slate-100'>
                                  <pre className='whitespace-pre-line bg-slate-100 p-2 rounded-md dark:bg-slate-800'> {assist.data.text.split('\n').map((line, i) => {
                                        const colon = line.indexOf(':')
                                        if (colon === -1) {
                                            return <p key={i}>{line || '\u00a0'}</p>
                                        }
                                        const label = line.slice(0, colon).trim()
                                        const value = line.slice(colon + 1)
                                        return (
                                            <p key={i}>
                                                <span className='font-semibold'>{label}:</span>
                                                {value}
                                            </p>
                                        )
                                    })} 
                                    </pre>
                                    <p className='mt-2 flex justify-end'> 
                                    <button type="button" onClick={() => setReply( assist.data.text)} className='rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50'>Insert Draft</button>
                                    </p>
                                    
                                   
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* {!isLoading && !isError && ticket && (<>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>
                <Link to="/tickets">Back to list</Link>
                <h2>{ticket.title}</h2>
                <p>{ticket.body}</p>
                <p>Status:{ticket.status}</p>
                <p>Priority:{ticket.priority}</p>
                <p>Category:{ticket.category}</p>
                <button type="button" onClick={() => updateStatus.mutate(status)} disabled={updateStatus.isPending}>Save Status</button>

                <div>
                  
                    <textarea value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Agent's Reply"
                        rows="4"
                        cols="50"
                    />

                    <button type="button" onClick={() => assist.mutate('summarize')} disabled={assist.isPending}> Summarize</button>
                    <button type="button" onClick={() => assist.mutate('triage')} disabled={assist.isPending}>Triage</button>
                    <button type="button" onClick={() => assist.mutate('draft')} disabled={assist.isPending}>Draft</button>

                    <div>
                        {assist.isPending && <p>thinking...</p>}
                        {assist.isError && <p>Error: {assist.error?.message}</p>}
                        {assist.data && assist.data.type === 'summary' && (<>summary:{assist.data.bullets.map((bullet) => <ul key={bullet}>{bullet}</ul>)}</>)}
                        {assist.data && assist.data.type === 'triage' && (<p>triage:{assist.data.priority} {assist.data.category} <button type="button" onClick={() => applytriage.mutate(assist.data)} disabled={applytriage.isPending}> Apply Triage</button></p>)}
                        {assist.data && assist.data.type === 'draft' && (<>draft:{assist.data.text}   <button type="button" onClick={() => setReply(assist.data.text)}>Insert draft</button></>)}
                        {assist.data && assist.data.type === 'error' && (<>error:{assist.data.text}</>)}
                    </div>


                </div>
            </>)} */}



            </div>




        </div>
    )
}
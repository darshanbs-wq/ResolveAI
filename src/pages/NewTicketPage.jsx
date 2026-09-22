
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createTicket } from "../api/tickets.js";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
export default function NewTicketPage() {
const queryClient = useQueryClient();
const navigate = useNavigate();
const {register,handleSubmit,formState:{errors}} =useForm();

const create = useMutation({
    mutationFn:createTicket,
    onSuccess:(newTicket) =>{
        queryClient.invalidateQueries({queryKey:['tickets']})
        navigate(`/tickets/${newTicket.id}`)
    },
    onError:(error) =>{
        console.error(error)
    }
})

// const [title,setTitle] = useState('');
// const [body,setBody] = useState('');
// const [priority,setPriority] = useState('medium');
// const [category,setCategory] = useState('general');









    const fieldClass =
        'w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink shadow-sm transition-colors focus:border-brand focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900 dark:focus:border-teal-500 dark:focus:ring-teal-500'
    const labelClass = 'mb-1.5 block text-sm font-medium text-ink dark:text-slate-200'

    return (
        <div className='min-h-screen bg-canvas text-ink dark:bg-slate-950 dark:text-slate-100'>
            <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <Link to="/tickets" className="text-sm font-medium text-muted hover:text-ink transition-colors dark:text-slate-400 dark:hover:text-slate-100">
          ← Inbox
        </Link>
        <h1 className="mt-2 font-display text-xl font-semibold text-ink dark:text-slate-100">New Ticket</h1>
        <p className="mt-0.5 text-xs text-muted dark:text-slate-400">Capture a customer issue to triage</p>
      </div>
            <div className='mx-auto max-w-2xl p-6'>
            <form onSubmit={handleSubmit((values) => create.mutate(values))} className='space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
               <div>
                <label htmlFor="title" className={labelClass}>Title</label>
                <input type ="text" id ="title" {...register("title",{required:true})} className={fieldClass}  />
                {errors.title && <p className='mt-1 text-sm text-red-600 dark:text-red-400'>Title is required</p>}
               </div>
               <div>
                <label htmlFor ="body" className={labelClass}>Body</label>
                <textarea id ="body"  placeholder="Paste or type the customer's message…"{...register("body",{required:true})} rows={8} className={fieldClass} />
                {errors.body && <p className='mt-1 text-sm text-red-600 dark:text-red-400'>Body is required</p>}
               </div>
               <div className="grid gap-4 sm:grid-cols-2">
               <div>
                <label htmlFor="priority" className={labelClass}>Priority</label>
                <select id ='priority'{...register("priority",{required:true})} className={fieldClass} defaultValue="medium">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                {errors.priority && <p className='mt-1 text-sm text-red-600 dark:text-red-400'>Priority is required</p>}
               </div>
               <div>
                <label htmlFor ="category" className={labelClass}>Category</label>
                <select id ='category'{...register("category",{required:true})} className={fieldClass} >
                    <option value="general">General</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="account">Account</option>
                </select>
                {errors.category && <p className='mt-1 text-sm text-red-600 dark:text-red-400'>Category is required</p>}
               </div>
               </div>
               <div className="flex  pt-2 gap-2">
               <button type ='submit' disabled={create.isPending} className='rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60 dark:bg-teal-700 dark:hover:bg-teal-600'>Create Ticket</button>
               <button type="button" onClick={() => navigate('/tickets')} className='rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800'    >back to tickets</button>
          

               </div>
                </form>

            </div>
             
           
        </div>
    );
}
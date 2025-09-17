import { createClient } from '../utils/supabase/server';
import { redirect } from 'next/navigation';
import VNMakerContent from './VNMakerContent';
import '../../app/globals.css';

export default async function VNmaker() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getSession();
  
    if (error || !data.session) {
      redirect('/login?message=Please log in or create an account to access the Visual Novel Studio.');
    }

    return <VNMakerContent />;
}
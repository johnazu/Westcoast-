import { supabase } from './supabaseClient';

export const authService = {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const profile = await authService.getProfile(data.user.id);
    if (!profile) throw { message: 'No staff profile found for this account' };
    if (!profile.is_active) {
      await supabase.auth.signOut();
      throw { message: 'Your account has been deactivated. Please contact an administrator.' };
    }

    await supabase.from('admin_profiles').update({ last_login: new Date().toISOString() }).eq('id', data.user.id);

    return { user: data.user, profile };
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getProfile(userId) {
    const { data, error } = await supabase.from('admin_profiles').select('*').eq('id', userId).maybeSingle();
    if (error) throw error;
    return data;
  },

  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  // Admin-only: create a new staff account. Requires the admin's own session,
  // and since Supabase client-side signUp creates+signs-in the new user,
  // we immediately restore the admin's session afterward.
  async registerStaff({ firstName, lastName, email, phone, password, role }) {
    const { data: adminSession } = await supabase.auth.getSession();

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    const { error: profileErr } = await supabase.from('admin_profiles').insert({
      id: data.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      role: role || 'staff'
    });

    // Restore the original admin session (signUp switches the active session to the new user)
    if (adminSession?.session) {
      await supabase.auth.setSession({
        access_token: adminSession.session.access_token,
        refresh_token: adminSession.session.refresh_token
      });
    }

    if (profileErr) throw profileErr;
    return data.user;
  },

  async getUsers() {
    const { data, error } = await supabase.from('admin_profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async deleteUser(id) {
    // Removing the admin_profiles row revokes all staff access via RLS immediately.
    // (Deleting the underlying auth.users row requires the service role and isn't
    // available from the browser — do that from the Supabase dashboard if needed.)
    const { error } = await supabase.from('admin_profiles').delete().eq('id', id);
    if (error) throw error;
  }
};

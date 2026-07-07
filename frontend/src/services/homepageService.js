import { supabase } from './supabaseClient';

export const homepageService = {
  async get() {
    const { data, error } = await supabase.from('homepage_content').select('*').eq('id', 1).single();
    if (error) throw error;
    return data;
  },

  async update(fields) {
    const { data, error } = await supabase.from('homepage_content').update(fields).eq('id', 1).select().single();
    if (error) throw error;
    return data;
  },

  async uploadHeroImage(file) {
    const { data: current } = await supabase.from('homepage_content').select('hero').eq('id', 1).single();

    if (current?.hero?.backgroundImage?.path) {
      await supabase.storage.from('homepage-images').remove([current.hero.backgroundImage.path]);
    }

    const ext = file.name.split('.').pop();
    const path = `hero/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('homepage-images').upload(path, file);
    if (uploadErr) throw uploadErr;

    const { data: urlData } = supabase.storage.from('homepage-images').getPublicUrl(path);
    const newHero = { ...current.hero, backgroundImage: { url: urlData.publicUrl, path } };

    const { data, error } = await supabase.from('homepage_content').update({ hero: newHero }).eq('id', 1).select().single();
    if (error) throw error;
    return data;
  },

  async addTestimonial({ name, rating, comment }) {
    const { data: current, error: fetchErr } = await supabase.from('homepage_content').select('testimonials').eq('id', 1).single();
    if (fetchErr) throw fetchErr;

    const items = current.testimonials?.items || [];
    items.push({ id: crypto.randomUUID(), name, rating, comment, date: new Date().toISOString() });

    const newTestimonials = { ...current.testimonials, items };
    const { data, error } = await supabase.from('homepage_content').update({ testimonials: newTestimonials }).eq('id', 1).select().single();
    if (error) throw error;
    return data;
  },

  async deleteTestimonial(testimonialId) {
    const { data: current, error: fetchErr } = await supabase.from('homepage_content').select('testimonials').eq('id', 1).single();
    if (fetchErr) throw fetchErr;

    const items = (current.testimonials?.items || []).filter(t => t.id !== testimonialId);
    const newTestimonials = { ...current.testimonials, items };

    const { data, error } = await supabase.from('homepage_content').update({ testimonials: newTestimonials }).eq('id', 1).select().single();
    if (error) throw error;
    return data;
  }
};

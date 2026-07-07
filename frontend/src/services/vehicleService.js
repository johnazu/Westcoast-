import { supabase } from './supabaseClient';

const VEHICLE_COLUMNS = '*';

// Translate camelCase filter params into the query
export const vehicleService = {
  async getAll({
    make, bodyType, fuelType, transmission, condition, availableFor,
    status, featured, minPrice, maxPrice, sort, page = 1, limit = 12
  } = {}) {
    let query = supabase.from('vehicles').select(VEHICLE_COLUMNS, { count: 'exact' });

    if (make) query = query.ilike('make', `%${make}%`);
    if (bodyType) query = query.eq('body_type', bodyType);
    if (fuelType) query = query.eq('fuel_type', fuelType);
    if (transmission) query = query.eq('transmission', transmission);
    if (condition) query = query.eq('condition', condition);
    if (availableFor) query = query.contains('available_for', [availableFor]);
    if (status) query = query.eq('status', status);
    if (featured !== undefined) query = query.eq('featured', featured === true || featured === 'true');
    if (minPrice) query = query.gte('sale_price', Number(minPrice));
    if (maxPrice) query = query.lte('sale_price', Number(maxPrice));

    if (sort) {
      const desc = sort.startsWith('-');
      query = query.order(desc ? sort.slice(1) : sort, { ascending: !desc });
    } else {
      query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data,
      total: count,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page
    };
  },

  async getOne(id) {
    const { data, error } = await supabase.from('vehicles').select(VEHICLE_COLUMNS).eq('id', id).single();
    if (error) throw error;

    // fire-and-forget view increment
    supabase.rpc('increment_vehicle_views', { p_vehicle_id: id }).then(() => {});

    return data;
  },

  async create(payload) {
    const { data, error } = await supabase.from('vehicles').insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase.from('vehicles').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    // Fetch first so we can clean up storage objects
    const { data: vehicle } = await supabase.from('vehicles').select('images, video').eq('id', id).single();

    if (vehicle?.images?.length) {
      const paths = vehicle.images.map(img => img.path).filter(Boolean);
      if (paths.length) await supabase.storage.from('vehicle-images').remove(paths);
    }
    if (vehicle?.video?.path) {
      await supabase.storage.from('vehicle-videos').remove([vehicle.video.path]);
    }

    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) throw error;
  },

  async uploadImages(id, files) {
    const { data: vehicle, error: fetchErr } = await supabase.from('vehicles').select('images').eq('id', id).single();
    if (fetchErr) throw fetchErr;

    const existing = vehicle.images || [];
    if (existing.length + files.length > 10) {
      throw new Error('Maximum of 10 images per vehicle');
    }

    const uploaded = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('vehicle-images').upload(path, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('vehicle-images').getPublicUrl(path);
      uploaded.push({ url: urlData.publicUrl, path });
    }

    const newImages = [...existing, ...uploaded];
    const { data, error } = await supabase.from('vehicles').update({ images: newImages }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteImage(id, imagePath) {
    const { data: vehicle, error: fetchErr } = await supabase.from('vehicles').select('images').eq('id', id).single();
    if (fetchErr) throw fetchErr;

    await supabase.storage.from('vehicle-images').remove([imagePath]);

    const newImages = (vehicle.images || []).filter(img => img.path !== imagePath);
    const { data, error } = await supabase.from('vehicles').update({ images: newImages }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async uploadVideo(id, file) {
    const { data: vehicle, error: fetchErr } = await supabase.from('vehicles').select('video').eq('id', id).single();
    if (fetchErr) throw fetchErr;

    if (vehicle.video?.path) {
      await supabase.storage.from('vehicle-videos').remove([vehicle.video.path]);
    }

    const ext = file.name.split('.').pop();
    const path = `${id}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('vehicle-videos').upload(path, file);
    if (uploadErr) throw uploadErr;

    const { data: urlData } = supabase.storage.from('vehicle-videos').getPublicUrl(path);
    const video = { url: urlData.publicUrl, path };

    const { data, error } = await supabase.from('vehicles').update({ video }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async getStats() {
    const { data, error } = await supabase.rpc('get_vehicle_stats').single();
    if (error) throw error;
    return {
      totalVehicles: Number(data.total_vehicles),
      availableForSale: Number(data.available_for_sale),
      availableForRental: Number(data.available_for_rental),
      sold: Number(data.sold),
      rented: Number(data.rented)
    };
  }
};

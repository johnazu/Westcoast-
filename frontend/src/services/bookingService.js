import { supabase } from './supabaseClient';

export const bookingService = {
  async createRental({ vehicleId, customer, rentalDetails, additionalOptions = [] }) {
    const { data: vehicle, error: vErr } = await supabase.from('vehicles').select('*').eq('id', vehicleId).single();
    if (vErr) throw vErr;

    if (!vehicle.available_for.includes('rental')) {
      throw new Error('This vehicle is not available for rental');
    }
    if (vehicle.status !== 'Available') {
      throw new Error('Vehicle is not currently available');
    }

    const { data: isAvailable, error: availErr } = await supabase.rpc('check_vehicle_availability', {
      p_vehicle_id: vehicleId,
      p_pickup: rentalDetails.pickupDate,
      p_return: rentalDetails.returnDate
    });
    if (availErr) throw availErr;
    if (!isAvailable) throw new Error('Vehicle is not available for the selected dates');

    const pickup = new Date(rentalDetails.pickupDate);
    const ret = new Date(rentalDetails.returnDate);
    const durationDays = Math.max(Math.ceil((ret - pickup) / (1000 * 60 * 60 * 24)), 1);

    let basePrice;
    if (durationDays >= 30 && vehicle.rental_monthly) {
      basePrice = vehicle.rental_monthly;
    } else if (durationDays >= 7 && vehicle.rental_weekly) {
      basePrice = vehicle.rental_weekly;
    } else {
      basePrice = (vehicle.rental_daily || 0) * durationDays;
    }

    const additionalTotal = additionalOptions.reduce((sum, o) => sum + o.price * durationDays, 0);
    const totalAmount = basePrice + additionalTotal;

    const payload = {
      booking_type: 'rental',
      vehicle_id: vehicleId,
      customer_first_name: customer.firstName,
      customer_last_name: customer.lastName,
      customer_email: customer.email,
      customer_phone: customer.phone,
      drivers_license_number: customer.driversLicense?.number,
      drivers_license_expiry: customer.driversLicense?.expiryDate || null,
      pickup_date: rentalDetails.pickupDate,
      return_date: rentalDetails.returnDate,
      duration_days: durationDays,
      additional_options: additionalOptions,
      base_price: basePrice,
      total_amount: totalAmount,
      balance_due: totalAmount
    };

    const { data, error } = await supabase.from('bookings').insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async createTestDrive({ vehicleId, customer, testDriveDetails }) {
    const payload = {
      booking_type: 'test_drive',
      vehicle_id: vehicleId,
      customer_first_name: customer.firstName,
      customer_last_name: customer.lastName,
      customer_email: customer.email,
      customer_phone: customer.phone,
      preferred_date: testDriveDetails.preferredDate,
      preferred_time: testDriveDetails.preferredTime,
      message: testDriveDetails.message,
      base_price: 0,
      total_amount: 0
    };
    const { data, error } = await supabase.from('bookings').insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async createPurchaseInquiry({ vehicleId, customer, purchaseDetails }) {
    const { data: vehicle } = await supabase.from('vehicles').select('sale_price').eq('id', vehicleId).single();

    const payload = {
      booking_type: 'purchase_inquiry',
      vehicle_id: vehicleId,
      customer_first_name: customer.firstName,
      customer_last_name: customer.lastName,
      customer_email: customer.email,
      customer_phone: customer.phone,
      financing_needed: purchaseDetails.financingNeeded || false,
      trade_in_vehicle: purchaseDetails.tradeInVehicle || null,
      message: purchaseDetails.message,
      base_price: vehicle?.sale_price || 0,
      total_amount: vehicle?.sale_price || 0
    };
    const { data, error } = await supabase.from('bookings').insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async getByReference(reference) {
    const { data, error } = await supabase.rpc('get_booking_by_reference', { p_reference: reference }).single();
    if (error) throw error;
    return data;
  },

  async cancelByReference(reference, reason) {
    const { data, error } = await supabase.rpc('cancel_booking_by_reference', {
      p_reference: reference,
      p_reason: reason
    });
    if (error) throw error;
    return data;
  },

  // --- Admin/staff only (RLS-gated) ---
  async getAll({ status, bookingType } = {}) {
    let query = supabase
      .from('bookings')
      .select('*, vehicle:vehicles(make, model, year, images)')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (bookingType) query = query.eq('booking_type', bookingType);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getOne(id) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, vehicle:vehicles(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id, status) {
    const { data: booking, error: fetchErr } = await supabase.from('bookings').select('*').eq('id', id).single();
    if (fetchErr) throw fetchErr;

    const updates = { status };
    if (booking.booking_type === 'rental') {
      if (status === 'active') {
        updates.confirmed = true;
        updates.confirmed_at = new Date().toISOString();
        await supabase.from('vehicles').update({ status: 'Rented' }).eq('id', booking.vehicle_id);
      } else if (status === 'completed' || status === 'cancelled') {
        await supabase.from('vehicles').update({ status: 'Available' }).eq('id', booking.vehicle_id);
      }
    }

    const { data, error } = await supabase.from('bookings').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async getStats() {
    const { data, error } = await supabase.rpc('get_booking_stats').single();
    if (error) throw error;
    return {
      totalBookings: Number(data.total_bookings),
      pending: Number(data.pending),
      confirmed: Number(data.confirmed),
      active: Number(data.active),
      completed: Number(data.completed),
      cancelled: Number(data.cancelled),
      totalRevenue: Number(data.total_revenue)
    };
  }
};

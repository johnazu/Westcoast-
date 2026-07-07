import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import VehicleCard from '../components/VehicleCard';

const initialFilters = {
  make: '', bodyType: '', fuelType: '', transmission: '',
  condition: '', availableFor: '', minPrice: '', maxPrice: ''
};

const VehicleListPage = () => {
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    ...initialFilters,
    availableFor: searchParams.get('availableFor') || ''
  });

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      Object.keys(filters).forEach((key) => {
        if (filters[key]) params[key] = filters[key];
      });
      const res = await vehicleService.getAll(params);
      setVehicles(res.data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    setPage(1);
    fetchVehicles();
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  return (
    <div className="container" style={{ padding: '32px 16px' }}>
      <h1 style={{ marginBottom: '24px' }}>Browse Our Vehicles</h1>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3 style={{ marginBottom: '16px' }}>Filters</h3>

          <div className="form-group">
            <label>Make</label>
            <input className="form-control" name="make" value={filters.make} onChange={handleFilterChange} placeholder="e.g. Toyota" />
          </div>

          <div className="form-group">
            <label>Body Type</label>
            <select className="form-control" name="bodyType" value={filters.bodyType} onChange={handleFilterChange}>
              <option value="">Any</option>
              {['Sedan', 'SUV', 'Truck', 'Van', 'Coupe', 'Convertible', 'Wagon', 'Hatchback', 'Minivan'].map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fuel Type</label>
            <select className="form-control" name="fuelType" value={filters.fuelType} onChange={handleFilterChange}>
              <option value="">Any</option>
              {['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'].map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Transmission</label>
            <select className="form-control" name="transmission" value={filters.transmission} onChange={handleFilterChange}>
              <option value="">Any</option>
              {['Automatic', 'Manual', 'CVT', 'Semi-Automatic'].map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Available For</label>
            <select className="form-control" name="availableFor" value={filters.availableFor} onChange={handleFilterChange}>
              <option value="">Any</option>
              <option value="sale">Sale</option>
              <option value="rental">Rental</option>
            </select>
          </div>

          <div className="form-group">
            <label>Min Price (GHS)</label>
            <input className="form-control" type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} />
          </div>

          <div className="form-group">
            <label>Max Price (GHS)</label>
            <input className="form-control" type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} />
          </div>

          <button className="btn btn-primary btn-block" onClick={applyFilters}>Apply Filters</button>
          <button className="btn btn-secondary btn-block" style={{ marginTop: '8px' }} onClick={resetFilters}>Reset</button>
        </aside>

        <main>
          {loading ? (
            <div className="spinner" />
          ) : vehicles.length === 0 ? (
            <p>No vehicles found matching your criteria.</p>
          ) : (
            <>
              <div className="grid grid-3">
                {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
              </div>

              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button
                    className="btn btn-secondary"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    ← Prev
                  </button>
                  <span>Page {page} of {totalPages}</span>
                  <button
                    className="btn btn-secondary"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const styles = {
  layout: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: '32px',
    alignItems: 'start'
  },
  sidebar: {
    background: '#F9FAFB',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    position: 'sticky',
    top: '90px'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '32px'
  }
};

export default VehicleListPage;

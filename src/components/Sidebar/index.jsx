import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { IoMdClose } from 'react-icons/io';
import debounce from 'lodash.debounce';
import { getGeoLocation } from '../../fetchApi';
import { FaMapMarkedAlt, FaRoute } from 'react-icons/fa';
import { HiLocationMarker } from 'react-icons/hi';
import { Controller, useForm } from 'react-hook-form';

const Sidebar = ({
  onFindRoute,
  onClose,
  isOpen,
  control,
  watch,
  setVariant,
  variant,
}) => {
  const [lonLatFrom, setLonLatFrom] = useState(null);
  const [lonLatTo, setLonLatTo] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('initial'); // 'initial', 'route', 'location'

  const fetchOptions = debounce(async (query) => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await getGeoLocation(query);
      const data = response.map((item) => ({
        label: item.display_name,
        value: item.lat + ',' + item.lon,
      }));
      setOptions(data);
    } catch (error) {
      console.error('Error fetching data from API', error);
      setOptions([]);
    }
    setLoading(false);
  }, 300);

  const handleInputChange = (inputValue) => {
    fetchOptions(inputValue);
  };

  const handleChangeFrom = (selectedOption) => {
    const [lat, lon] = selectedOption.value.split(',');
    setLonLatFrom({ lat, lon });
  };

  const handleChangeTo = (selectedOption) => {
    const [lat, lon] = selectedOption.value.split(',');
    setLonLatTo({ lat, lon });
  };

  const handleFindRoute = () => {
    if (watch('from') && watch('to')) {
      onFindRoute({ from: lonLatFrom, to: lonLatTo });
      onClose();
    } else {
      alert('Please select both start and end locations.');
    }
  };

  useEffect(() => {
    if (watch('from')) {
      const [lat, lon] = watch('from').value.split(',');
      setLonLatFrom({ lat, lon });
    }
  }, [watch('from')]);

  return (
    <div
      className={`fixed top-0 left-0 mt-5 bg-white rounded-2xl p-4 z-10 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-96'
      }`}
      style={{ width: '300px', marginLeft: '20px' }} // Adjust width, height, and margin
      aria-hidden={!isOpen}
    >
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold mb-4">
          {view === 'initial'
            ? 'menu'
            : view === 'route'
            ? 'Temukan Rute Lokasi'
            : 'Pilih jenis peta'}
        </h2>
        <button
          onClick={onClose}
          className="mb-4 p-2 border text-black rounded"
        >
          <IoMdClose />
        </button>
      </div>

      {view === 'initial' && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setView('route')}
            className={`bg-white shadow-md p-2 py-4 rounded-lg flex flex-col gap-2 justify-center items-center min-h-16 hover:bg-gray-100`}
          >
            <FaRoute size={25} />
            <p className="text-sm font-bold">Pencarian Route</p>
          </button>
          <button
            onClick={() => setView('variant')}
            className={`bg-white shadow-md p-2 py-4 rounded-lg flex flex-col gap-2 justify-center items-center min-h-16 hover:bg-gray-100`}
          >
            <FaMapMarkedAlt size={25} />
            <p className="text-sm font-bold">Jenis Peta</p>
          </button>
          
        </div>
        
      )}

      {view === 'route' && (
        <div>
          <div>
            <p className="text-sm text-gray-500">Dari</p>
            <Controller
              name="from"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Pilih lokasi"
                  onInputChange={handleInputChange}
                  isLoading={loading}
                  options={options}
                  className="basic-single mb-4"
                  classNamePrefix="select"
                  isClearable
                  onChange={(e) => {
                    field.onChange(e);
                    handleChangeFrom(e);
                  }}
                />
              )}
            />
          </div>

          <div>
            <p className="text-sm text-gray-500">Ke</p>
            <Controller
              name="to"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Pilih lokasi"
                  onInputChange={handleInputChange}
                  isLoading={loading}
                  options={options}
                  className="basic-single mb-4"
                  classNamePrefix="select"
                  isClearable
                  onChange={(e) => {
                    field.onChange(e);
                    handleChangeTo(e);
                  }}
                />
              )}
            />
          </div>

          <div className="flex justify-between mt-5">
            <button
              onClick={() => setView('initial')}
              className="text-black p-2 rounded-lg font-bold italic hover:underline text-sm"
            >
              Kembali
            </button>

            <button
              onClick={handleFindRoute}
              className="bg-blue-500 text-white py-1 px-4 rounded-lg"
            >
              Cari
            </button>
          </div>
        </div>
      )}

      {view === 'variant' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div
              className={`flex flex-col items-center`}
              onClick={() => setVariant('basic-v2')}
            >
              <img
                src="https://cloud.maptiler.com/static/img/maps/basic-v2.png?t=1713275643"
                className={`rounded hover:shadow-lg ${
                  variant === 'basic-v2' && 'border-2 border-black'
                }`}
              />
              <p className="text-sm">Base Map</p>
            </div>
            <div
              className={`flex flex-col items-center`}
              onClick={() => setVariant('streets')}
            >
              <img
                src="https://cloud.maptiler.com/static/img/maps/streets-v2.png?t=1713275643"
                className={`rounded hover:shadow-lg ${
                  variant === 'streets' && 'border-2 border-black'
                }`}
              />
              <p className="text-sm">Street Map</p>
            </div>
            <div
              className={`flex flex-col items-center`}
              onClick={() => setVariant('satellite/256')}
            >
              <img
                src="https://cloud.maptiler.com/static/img/maps/satellite.png?t=1713275643"
                className={`rounded hover:shadow-lg ${
                  variant === 'satellite/256' && 'border-2 border-black'
                }`}
              />
              <p className="text-sm">Satelite Map</p>
            </div>
          </div>
          <div className="flex justify-start mt-5">
            <button
              onClick={() => setView('initial')}
              className="text-black p-2 rounded-lg font-bold italic hover:underline text-sm"
            >
              Kembali
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;

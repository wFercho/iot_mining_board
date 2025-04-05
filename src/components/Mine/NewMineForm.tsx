import React, { useState, FormEvent } from "react";

// Define our types
interface GPSCoordinates {
  Lng: number;
  Lat: number;
}

interface MineFormData {
  Name: string;
  CompanyName: string;
  Coordinates: GPSCoordinates;
  City: string;
  Department: string;
  Neighborhood: string;
  OperationalStatus: string;
  Address: string;
}

const NewMineForm: React.FC = () => {
  // Form state with default values
  const [formData, setFormData] = useState<MineFormData>({
    Name: "",
    CompanyName: "",
    Coordinates: { Lng: 0, Lat: 0 },
    City: "",
    Department: "",
    Neighborhood: "",
    OperationalStatus: "Active", // Default value
    Address: "",
  });

  // Input change handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      // Handle nested coordinates object
      if (name === "Lat" || name === "Lng") {
        return {
          ...prev,
          Coordinates: {
            ...prev.Coordinates,
            [name]: parseFloat(value) || 0,
          },
        };
      }

      // Handle all other fields
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  // Form submission handler
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    // Here you would typically send the data to your API
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className=" w-full mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <form className="px-6 py-6 space-y-6" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div>
            <label
              htmlFor="Name"
              className="block text-sm font-medium text-gray-700"
            >
              Mine Name
            </label>
            <input
              type="text"
              name="Name"
              id="Name"
              value={formData.Name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="CompanyName"
              className="block text-sm font-medium text-gray-700"
            >
              Company Name
            </label>
            <input
              type="text"
              name="CompanyName"
              id="CompanyName"
              value={formData.CompanyName}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* GPS Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="Lat"
                className="block text-sm font-medium text-gray-700"
              >
                Latitude
              </label>
              <input
                type="number"
                name="Lat"
                id="Lat"
                value={formData.Coordinates.Lat}
                onChange={handleChange}
                step="any"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="Lng"
                className="block text-sm font-medium text-gray-700"
              >
                Longitude
              </label>
              <input
                type="number"
                name="Lng"
                id="Lng"
                value={formData.Coordinates.Lng}
                onChange={handleChange}
                step="any"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Location Information */}
          <div>
            <label
              htmlFor="Department"
              className="block text-sm font-medium text-gray-700"
            >
              Department
            </label>
            <input
              type="text"
              name="Department"
              id="Department"
              value={formData.Department}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="City"
              className="block text-sm font-medium text-gray-700"
            >
              City
            </label>
            <input
              type="text"
              name="City"
              id="City"
              value={formData.City}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="Neighborhood"
              className="block text-sm font-medium text-gray-700"
            >
              Neighborhood
            </label>
            <input
              type="text"
              name="Neighborhood"
              id="Neighborhood"
              value={formData.Neighborhood}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="Address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <input
              type="text"
              name="Address"
              id="Address"
              value={formData.Address}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Operational Status */}
          <div>
            <label
              htmlFor="OperationalStatus"
              className="block text-sm font-medium text-gray-700"
            >
              Operational Status
            </label>
            <select
              name="OperationalStatus"
              id="OperationalStatus"
              value={formData.OperationalStatus}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Under Maintenance</option>
              <option value="Planned">Planned</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Register Mine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewMineForm;

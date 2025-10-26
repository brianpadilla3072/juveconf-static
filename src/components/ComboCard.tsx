interface ComboCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  features: string[];
  onSelect: (id: string) => void;
}

export default function ComboCard({ id, title, description, price, features, onSelect }: ComboCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-48 flex items-center justify-center p-4">
        <h3 className="text-2xl sm:text-3xl font-bold text-white break-words text-center">{title}</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4 break-words hyphens-auto">{description}</p>
        <div className="mb-6">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-3xl sm:text-4xl font-bold text-gray-900 break-words">${price}</span>
            <span className="text-gray-500">USD</span>
          </div>
        </div>
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 break-words">{feature}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => onSelect(id)}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          Seleccionar Combo
        </button>
      </div>
    </div>
  );
}

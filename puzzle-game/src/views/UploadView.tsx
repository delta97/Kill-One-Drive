import { useNavigate } from 'react-router-dom';
import { ImageUploader } from '../components/Upload';
import { usePuzzleStore } from '../store';

export function UploadView() {
  const navigate = useNavigate();
  const imageUrl = usePuzzleStore((state) => state.imageUrl);

  const handleUploadComplete = () => {
    if (imageUrl) {
      navigate('/settings');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          🧩 Puzzle Game
        </h1>
        <p className="text-lg text-gray-600 max-w-md">
          Upload an image to create your custom jigsaw puzzle
        </p>
      </div>
      <ImageUploader onUploadComplete={handleUploadComplete} />
    </div>
  );
}

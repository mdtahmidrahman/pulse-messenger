import { XMarkIcon, ArrowDownTrayIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

const ImageViewer = ({ images, initialIndex = 0, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const currentImage = images[currentIndex];

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'ArrowRight') goToNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]);

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/40 rounded-full transition-colors z-10"
            >
                <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Download button */}
            <a
                href={route('message.downloadAttachment', currentImage.id)}
                className="absolute top-4 right-16 p-2 text-white/80 hover:text-white bg-black/40 rounded-full transition-colors z-10"
            >
                <ArrowDownTrayIcon className="w-6 h-6" />
            </a>

            {/* Image counter */}
            {images.length > 1 && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 rounded-full text-white text-sm z-10">
                    {currentIndex + 1} / {images.length}
                </div>
            )}

            {/* Previous button */}
            {images.length > 1 && (
                <button
                    onClick={goToPrev}
                    className="absolute left-4 p-2 text-white/80 hover:text-white bg-black/40 rounded-full transition-colors z-10"
                >
                    <ChevronLeftIcon className="w-8 h-8" />
                </button>
            )}

            {/* Image */}
            <img
                src={currentImage.url}
                alt={currentImage.name}
                className="max-w-[90vw] max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
            />

            {/* Next button */}
            {images.length > 1 && (
                <button
                    onClick={goToNext}
                    className="absolute right-4 p-2 text-white/80 hover:text-white bg-black/40 rounded-full transition-colors z-10"
                >
                    <ChevronRightIcon className="w-8 h-8" />
                </button>
            )}

            {/* Backdrop click to close */}
            <div
                className="absolute inset-0 -z-10"
                onClick={onClose}
            />
        </div>
    );
};

export default ImageViewer;

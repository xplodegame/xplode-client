import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Diamond } from 'lucide-react';

interface CosmicUsernameModalProps {
  isOpen: boolean;
  onUsernameSet: (username: string) => void;
}

const CosmicUsernameModal: React.FC<CosmicUsernameModalProps> = ({ isOpen, onUsernameSet }) => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a name');
      return;
    }

    if (username.length < 3) {
      setError('Name must be at least 3 characters');
      return;
    }

    if (username.length > 20) {
      setError('Name must be less than 20 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Call the parent component's function to update the username
      await onUsernameSet(username);
    } catch (err) {
      console.error('Failed to set username:', err);
      setError('Failed to set your name. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md mx-4 overflow-hidden rounded-xl bg-gradient-to-b from-zinc-900 to-black border border-white/10"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 to-emerald-500/0 rounded-3xl blur-xl opacity-50" />
            
            <div className="relative p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm w-fit mx-auto">
                <Diamond className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">Create Your Identity</span>
              </div>
              
              <h2 className="text-2xl font-bold text-center text-white">
                What shall the cosmos call you?
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 focus:border-emerald-500/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-red-400 text-sm"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-semibold rounded-lg hover:opacity-90 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black/80 rounded-full animate-spin mr-2" />
                      <span>Saving...</span>
                    </div>
                  ) : 'Begin Your Journey'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CosmicUsernameModal;
const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173',
  NODE_INITIAL_RADIUS_FACTOR: 0.25,
  NODE_MIN_SIZE: 60,
  NODE_MAX_SIZE: 100,
  PARTICLE_COUNT: 60,
  CHILD_NODE_RADIUS: 120,
};

export default config;


'use server';

/**
 * @fileoverview This is the main entry point for all Genkit flows in the application.
 * It uses the 'use server' directive to ensure that all imported flows and their
 * dependencies are treated as server-side code by the Next.js compiler. This prevents
 * server-only modules from being incorrectly bundled into the client-side application,
 * which would cause build failures.
 */

import './crop-recommendations';
import './disease-detection-flow';
import '../../lib/market-price-flow';
import './multilingual-chatbot-assistance';
import './personalized-space-flow';

    
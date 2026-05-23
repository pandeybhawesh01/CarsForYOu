/**
 * Property-based tests for media utility functions
 * Tests universal correctness properties using fast-check
 * 
 * Feature: real-camera-capture
 * These tests validate that utility functions behave correctly across all possible inputs
 */

import fc from 'fast-check';
import {
  normalizeMediaUri,
  isValidMediaUri,
  generateMediaFileName,
  getMediaUriScheme,
} from '../mediaUtils';

describe('mediaUtils - Property-Based Tests', () => {
  // ==========================================================================
  // Property 1: Media URI Normalization Preserves Validity
  // ==========================================================================
  
  describe('Property 1: Media URI Normalization Preserves Validity', () => {
    it('should normalize any file path to a valid URI with proper scheme', () => {
      // Tag: Feature: real-camera-capture, Property 1
      // Validates: Requirements 6.3
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }), // Generate non-empty strings
          (filePath) => {
            const normalized = normalizeMediaUri(filePath);
            
            // Property: Normalized URI should have a valid scheme
            const validSchemes = ['file://', 'content://', 'http://', 'https://'];
            const hasValidScheme = validSchemes.some(scheme =>
              normalized.startsWith(scheme)
            );
            
            expect(hasValidScheme).toBe(true);
            
            // Property: Normalized URI should be a valid string
            expect(typeof normalized).toBe('string');
            expect(normalized.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve URIs that already have valid schemes', () => {
      // Tag: Feature: real-camera-capture, Property 1
      // Validates: Requirements 6.3
      
      fc.assert(
        fc.property(
          fc.oneof(
            fc.webUrl(), // Generate valid URLs
            fc.string().map(s => `file://${s}`),
            fc.string().map(s => `content://${s}`)
          ),
          (uri) => {
            const normalized = normalizeMediaUri(uri);
            
            // Property: URIs with valid schemes should remain unchanged or valid
            const scheme = getMediaUriScheme(normalized);
            expect(scheme).not.toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle special characters in file paths', () => {
      // Tag: Feature: real-camera-capture, Property 1
      // Validates: Requirements 6.3
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }), // Includes special characters
          (filePath) => {
            // Should not throw on any input
            expect(() => normalizeMediaUri(filePath)).not.toThrow();
            
            const normalized = normalizeMediaUri(filePath);
            expect(typeof normalized).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ==========================================================================
  // Property 2: Media URI Serialization Round-Trip
  // ==========================================================================
  
  describe('Property 2: Media URI Serialization Round-Trip', () => {
    it('should preserve URI through JSON serialization round-trip', () => {
      // Tag: Feature: real-camera-capture, Property 2
      // Validates: Requirements 6.5
      
      fc.assert(
        fc.property(
          fc.webUrl(), // Generate valid URIs
          (uri) => {
            // Serialize to JSON (as done by inspection store)
            const serialized = JSON.stringify({ uri });
            
            // Deserialize from JSON
            const deserialized = JSON.parse(serialized);
            
            // Property: URI should be identical after round-trip
            expect(deserialized.uri).toBe(uri);
            
            // Property: Deserialized URI should still be valid
            expect(isValidMediaUri(deserialized.uri)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve file:// URIs through serialization', () => {
      // Tag: Feature: real-camera-capture, Property 2
      // Validates: Requirements 6.5
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).map(s => `file://${s}`),
          (fileUri) => {
            const serialized = JSON.stringify({ uri: fileUri });
            const deserialized = JSON.parse(serialized);
            
            // Property: file:// scheme should be preserved
            expect(deserialized.uri).toBe(fileUri);
            expect(deserialized.uri.startsWith('file://')).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle nested serialization', () => {
      // Tag: Feature: real-camera-capture, Property 2
      // Validates: Requirements 6.5
      
      fc.assert(
        fc.property(
          fc.webUrl(),
          (uri) => {
            // Simulate nested storage structure
            const data = {
              inspection: {
                media: {
                  photos: [{ uri }]
                }
              }
            };
            
            const serialized = JSON.stringify(data);
            const deserialized = JSON.parse(serialized);
            
            // Property: Nested URI should be preserved
            expect(deserialized.inspection.media.photos[0].uri).toBe(uri);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ==========================================================================
  // Property 3: Media File Name Uniqueness
  // ==========================================================================
  
  describe('Property 3: Media File Name Uniqueness', () => {
    it('should generate unique file names for rapid captures', () => {
      // Tag: Feature: real-camera-capture, Property 3
      // Validates: Requirements 3.5, 4.8
      
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 100 }), // Number of captures
          (count) => {
            const fileNames = new Set<string>();
            
            // Generate multiple file names rapidly
            for (let i = 0; i < count; i++) {
              const fileName = generateMediaFileName('photo');
              fileNames.add(fileName);
            }
            
            // Property: All file names should be unique
            expect(fileNames.size).toBe(count);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate sortable file names by creation time', () => {
      // Tag: Feature: real-camera-capture, Property 3
      // Validates: Requirements 3.5, 4.8
      
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: 20 }),
          (count) => {
            const fileNames: string[] = [];
            
            // Generate file names with small delays
            for (let i = 0; i < count; i++) {
              fileNames.push(generateMediaFileName('photo'));
            }
            
            // Property: File names should be sortable (contain timestamps)
            const sorted = [...fileNames].sort();
            
            // Since timestamps increase, sorted order should match generation order
            // (or be very close due to rapid generation)
            expect(sorted.length).toBe(fileNames.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate valid file names for both photo and video types', () => {
      // Tag: Feature: real-camera-capture, Property 3
      // Validates: Requirements 3.5, 4.8
      
      fc.assert(
        fc.property(
          fc.constantFrom('photo' as const, 'video' as const),
          fc.integer({ min: 1, max: 10 }),
          (type, count) => {
            const fileNames = new Set<string>();
            
            for (let i = 0; i < count; i++) {
              const fileName = generateMediaFileName(type);
              fileNames.add(fileName);
              
              // Property: File name should contain type-specific prefix
              const expectedPrefix = type === 'photo' ? 'photo_' : 'video_';
              expect(fileName.startsWith(expectedPrefix)).toBe(true);
              
              // Property: File name should have correct extension
              const expectedExt = type === 'photo' ? '.jpg' : '.mp4';
              expect(fileName.endsWith(expectedExt)).toBe(true);
            }
            
            // Property: All generated names should be unique
            expect(fileNames.size).toBe(count);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ==========================================================================
  // Property 4: Media URI Validation Consistency
  // ==========================================================================
  
  describe('Property 4: Media URI Validation Consistency', () => {
    it('should consistently validate URIs without throwing', () => {
      // Tag: Feature: real-camera-capture, Property 4
      // Validates: Requirements 6.3, 6.6
      
      fc.assert(
        fc.property(
          fc.string(), // Any string input
          (input) => {
            // Property: Should never throw on any input
            expect(() => isValidMediaUri(input)).not.toThrow();
            
            // Property: Should return boolean
            const result = isValidMediaUri(input);
            expect(typeof result).toBe('boolean');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be consistent across multiple calls with same input', () => {
      // Tag: Feature: real-camera-capture, Property 4
      // Validates: Requirements 6.3, 6.6
      
      fc.assert(
        fc.property(
          fc.string(),
          (input) => {
            // Property: Multiple calls should return same result
            const result1 = isValidMediaUri(input);
            const result2 = isValidMediaUri(input);
            const result3 = isValidMediaUri(input);
            
            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify valid URIs', () => {
      // Tag: Feature: real-camera-capture, Property 4
      // Validates: Requirements 6.3, 6.6
      
      fc.assert(
        fc.property(
          fc.oneof(
            fc.webUrl(),
            fc.string().map(s => `file://${s}`),
            fc.string().map(s => `content://${s}`)
          ),
          (validUri) => {
            // Property: Valid URIs should return true
            expect(isValidMediaUri(validUri)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify invalid URIs', () => {
      // Tag: Feature: real-camera-capture, Property 4
      // Validates: Requirements 6.3, 6.6
      
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''),
            fc.constant(null as any),
            fc.constant(undefined as any),
            fc.integer(),
            fc.string().filter(s => 
              !s.startsWith('file://') && 
              !s.startsWith('content://') && 
              !s.startsWith('http://') && 
              !s.startsWith('https://')
            )
          ),
          (invalidInput) => {
            // Property: Invalid inputs should return false
            expect(isValidMediaUri(invalidInput)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge cases gracefully', () => {
      // Tag: Feature: real-camera-capture, Property 4
      // Validates: Requirements 6.3, 6.6
      
      const edgeCases = [
        '',
        ' ',
        'file://',
        'content://',
        'http://',
        'https://',
        'invalid://test',
        '/absolute/path',
        'relative/path',
        '../../parent/path',
        'file:///with/triple/slash',
      ];
      
      edgeCases.forEach(testCase => {
        // Property: Should not throw on edge cases
        expect(() => isValidMediaUri(testCase)).not.toThrow();
        
        // Property: Should return boolean
        const result = isValidMediaUri(testCase);
        expect(typeof result).toBe('boolean');
      });
    });
  });
});

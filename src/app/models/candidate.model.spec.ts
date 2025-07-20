import { Candidate, CandidateResponse, FileData } from './candidate.model';

describe('Candidate Models', () => {
  describe('Candidate', () => {
    it('should create an candidate instance', () => {
      const candidate: Candidate = {
        name: 'Juan',
        surname: 'Pérez',
        seniority: 'junior',
        yearsOfExperience: 2,
        availability: true
      };

      expect(candidate).toBeTruthy();
      expect(candidate.name).toBe('Juan');
      expect(candidate.surname).toBe('Pérez');
      expect(candidate.seniority).toBe('junior');
      expect(candidate.yearsOfExperience).toBe(2);
      expect(candidate.availability).toBe(true);
    });

    it('should accept senior seniority', () => {
      const candidate: Candidate = {
        name: 'Ana',
        surname: 'García',
        seniority: 'senior',
        yearsOfExperience: 5,
        availability: false
      };

      expect(candidate.seniority).toBe('senior');
    });
  });

  describe('CandidateResponse', () => {
    it('should create an candidate response instance', () => {
      const response: CandidateResponse = {
        id: '123',
        name: 'Juan',
        surname: 'Pérez',
        seniority: 'junior',
        yearsOfExperience: 2,
        availability: true,
        timestamp: new Date()
      };

      expect(response).toBeTruthy();
      expect(response.id).toBe('123');
      expect(response.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('FileData', () => {
    it('should create a file data instance', () => {
      const fileData: FileData = {
        seniority: 'senior',
        yearsOfExperience: 7,
        availability: true
      };

      expect(fileData).toBeTruthy();
      expect(fileData.seniority).toBe('senior');
      expect(fileData.yearsOfExperience).toBe(7);
      expect(fileData.availability).toBe(true);
    });
  });
});

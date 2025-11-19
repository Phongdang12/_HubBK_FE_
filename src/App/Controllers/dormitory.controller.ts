import { Request, Response } from 'express';
import { DormitoryCardService } from '@/Services/dormitoryCard.service';

class DormitoryCardController {
  static async checkDormitoryCard(req: Request, res: Response): Promise<void> {
    try {
      const ssn = req.params.ssn;
      const result = await DormitoryCardService.checkDormitoryCard(ssn);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error checking dormitory card:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async createDormitoryCard(req: Request, res: Response): Promise<void> {
    try {
      const ssn = req.params.ssn;
      const result = await DormitoryCardService.createDormitoryCard(ssn);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error setting dormitory card:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async setDormitoryCard(req: Request, res: Response): Promise<void> {
    try {
      const ssn = req.params.ssn;
      const result = await DormitoryCardService.setDormitoryCard(ssn);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error setting dormitory card:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
export default DormitoryCardController;

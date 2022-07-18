import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@interfaces/auth.interface';
import KeywordService from '@services/keyword.service';

class KeywordController {
  public keywordService = new KeywordService();

  public get = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const [keywords, total] = await this.keywordService.getByKeywordAndUserId(req.query.q as string, req.user.id);

      res.status(200).json({ data: keywords, total, message: 'OK' });
    } catch (error) {
      next(error);
    }
  };
}

export default KeywordController;

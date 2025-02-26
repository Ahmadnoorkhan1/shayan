import apiService from "./api";

interface ImageGenerationResponse {
  success: boolean;
  data: string;
  message: string;
}

export const generateImage = async (prompt: string): Promise<ImageGenerationResponse> => {
  try {
    const response = await apiService.post('/generate-image', { prompt });
    return response;
  } catch (error:any) {
    console.error(error);
    return {
      success: false,
      data: '',
      message: 'Failed to generate image'
    };
  }
};
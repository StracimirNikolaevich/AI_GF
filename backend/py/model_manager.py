"""
Model Manager for HuggingFace Models
Handles lazy loading, caching, and GPU/CPU detection
"""
import torch
import logging
from typing import Optional, Dict, Any
import os

logger = logging.getLogger(__name__)

class ModelManager:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.models: Dict[str, Any] = {}
        logger.info(f"ModelManager initialized on device: {self.device}")
    
    def load_chat_model(self, model_name: str = "Tann-dev/sex-chat-dirty-girlfriend"):
        """Load chat model with transformers pipeline"""
        if model_name in self.models:
            return self.models[model_name]
        
        try:
            from transformers import pipeline
            logger.info(f"Loading chat model: {model_name}")
            
            model = pipeline(
                "text-generation",
                model=model_name,
                device=0 if self.device == "cuda" else -1,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
            )
            
            self.models[model_name] = model
            logger.info(f"Chat model loaded successfully: {model_name}")
            return model
        except Exception as e:
            logger.error(f"Failed to load chat model {model_name}: {e}")
            raise
    
    def load_tts_model(self):
        """Load Coqui XTTS-v2 for text-to-speech"""
        if "xtts" in self.models:
            return self.models["xtts"]
        
        try:
            from TTS.api import TTS
            logger.info("Loading XTTS-v2 model")
            
            # XTTS-v2 supports voice cloning
            model = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(self.device)
            
            self.models["xtts"] = model
            logger.info("XTTS-v2 loaded successfully")
            return model
        except Exception as e:
            logger.error(f"Failed to load TTS model: {e}")
            raise
    
    def load_image_gen_model(self):
        """Load Wan2.2 LoRA for image generation"""
        if "image_gen" in self.models:
            return self.models["image_gen"]
        
        try:
            from diffusers import StableDiffusionPipeline
            logger.info("Loading Wan2.2 image generation model")
            
            # Using Stable Diffusion as base (Wan2.2 is typically a LoRA add-on)
            model = StableDiffusionPipeline.from_pretrained(
                "runwayml/stable-diffusion-v1-5",
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
            ).to(self.device)
            
            if self.device == "cuda":
                model.enable_attention_slicing()
            
            self.models["image_gen"] = model
            logger.info("Image generation model loaded")
            return model
        except Exception as e:
            logger.error(f"Failed to load image gen model: {e}")
            raise
    
    def load_image_edit_model(self):
        """Load Qwen Image Edit for image editing"""
        if "image_edit" in self.models:
            return self.models["image_edit"]
        
        try:
            from transformers import AutoProcessor, AutoModel
            logger.info("Loading Qwen image edit model")
            
            processor = AutoProcessor.from_pretrained("Qwen/Qwen-Image-Edit-2509")
            model = AutoModel.from_pretrained(
                "Qwen/Qwen-Image-Edit-2509",
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
            ).to(self.device)
            
            self.models["image_edit"] = {"processor": processor, "model": model}
            logger.info("Image edit model loaded")
            return self.models["image_edit"]
        except Exception as e:
            logger.error(f"Failed to load image edit model: {e}")
            raise
    
    
    def load_ddpm_model(self):
        """Load Google DDPM for fast image generation"""
        if "ddpm" in self.models:
            return self.models["ddpm"]
        
        try:
            from diffusers import DDPMPipeline
            logger.info("Loading DDPM-CIFAR10 model")
            
            model = DDPMPipeline.from_pretrained("google/ddpm-cifar10-32").to(self.device)
            
            self.models["ddpm"] = model
            logger.info("DDPM model loaded (fast 32x32 generation)")
            return model
        except Exception as e:
            logger.error(f"Failed to load DDPM model: {e}")
            raise
    
    def unload_model(self, model_key: str):
        """Unload a model to free memory"""
        if model_key in self.models:
            del self.models[model_key]
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            logger.info(f"Unloaded model: {model_key}")

# Global instance
model_manager = ModelManager()

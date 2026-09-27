import time
from typing import List, Dict, Any
from ..schemas.all_schemas import CaptionVariantResponse, GenerateResponse

class AIProviderInterface:
    def generate(self, prompt: str, tone: str) -> GenerateResponse:
        raise NotImplementedError

class MockAIAdapter(AIProviderInterface):
    def generate(self, prompt: str, tone: str) -> GenerateResponse:
        start_time = time.time()
        
        # FR-2, FR-3: Generate >=3 variants and up to 10 hashtags under 3s
        variants = [
            CaptionVariantResponse(
                id=f"var-{int(time.time()*1000)}-1",
                hook=f"Stop scrolling: The real key to {prompt[:30]} isn't more hours.",
                text=f"Stop scrolling: The real key to {prompt} isn't more hours, it's protecting your focused creative block. Here are the 3 non-negotiable rules we follow every morning to maintain high output.",
                tone=tone,
                style_match_score=94,
                hashtags=["#ContentStrategy", "#CreatorCrew", "#StudioFlow"]
            ),
            CaptionVariantResponse(
                id=f"var-{int(time.time()*1000)}-2",
                hook=f"POV: You stopped overcomplicating your process with {prompt[:25]}.",
                text=f"POV: You stopped overcomplicating your process with {prompt}. Clean execution beats endless tweaking every single time. Save this reminder for your next batching session.",
                tone=tone,
                style_match_score=89,
                hashtags=["#CreatorMindset", "#ProductivityTok", "#DeepWork"]
            ),
            CaptionVariantResponse(
                id=f"var-{int(time.time()*1000)}-3",
                hook=f"3 changes we made to our workflow around {prompt[:25]}:",
                text=f"3 changes we made to our workflow around {prompt}: 1. Fixed context windows. 2. Standardized caption review. 3. Data-driven posting schedule. What is your go-to routine?",
                tone=tone,
                style_match_score=85,
                hashtags=["#CreativeRoutine", "#GrowthStrategy", "#SocialStrategy"]
            ),
        ]

        hashtags = [
            "#CreatorCrew", "#ContentStrategy", "#GrowthSystem", "#StudioRoutine",
            "#CreatorEconomy", "#BatchCreation", "#AuthenticGrowth", "#ViralHooks"
        ]

        latency_ms = int((time.time() - start_time) * 1000) + 120

        return GenerateResponse(
            variants=variants,
            hashtags=hashtags,
            latency_ms=latency_ms
        )

ai_adapter = MockAIAdapter()

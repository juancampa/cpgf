doMain();

function doMain()
{

	// Defines MyPai
	var MyPai = 3.14159;

	// Create the window of the application
	var App = new sfml.RenderWindow(new sfml.VideoMode(800, 600, 32), "SFML Pong");

	// Load the sounds used in the game
	var BallSoundBuffer = new sfml.SoundBuffer();
	
	if(!BallSoundBuffer.LoadFromFile("datas/pong/ball.wav"))
	{
		return sfml.EXIT_FAILURE;
	}
	var BallSound = new sfml.Sound(BallSoundBuffer);

	// Load the images used in the game
	var BackgroundImage = new sfml.Image();
	var LeftPaddleImage = new sfml.Image;
	var RightPaddleImage = new sfml.Image();
	var BallImage = new sfml.Image();
	if (!BackgroundImage.LoadFromFile("datas/pong/background.jpg")    ||
		!LeftPaddleImage.LoadFromFile("datas/pong/paddle_left.png")   ||
		!RightPaddleImage.LoadFromFile("datas/pong/paddle_right.png") ||
		!BallImage.LoadFromFile("datas/pong/ball.png"))
	{
		return EXIT_FAILURE;
	}

	// Load the text font
	var Cheeseburger = new sfml.Font();
//	if (!Cheeseburger.LoadFromFile("datas/post-fx/cheeseburger.ttf"))
//		return EXIT_FAILURE;

	// Initialize the end text
	var End = new sfml.String();
	End.SetFont(Cheeseburger);
	End.SetSize(60.0);
	End.Move(150.0, 200.0);
	End.SetColor(new sfml.Color(50, 50, 250));

	// Create the sprites of the background, the paddles and the ball
	var Background = new sfml.Sprite(BackgroundImage);
	var LeftPaddle = new sfml.Sprite(LeftPaddleImage);
	var RightPaddle = new sfml.Sprite(RightPaddleImage);
	var Ball = new sfml.Sprite(BallImage);

	LeftPaddle.Move(10, (App.GetView().GetRect().GetHeight() - LeftPaddle.GetSize().y) / 2);
	RightPaddle.Move(App.GetView().GetRect().GetWidth() - RightPaddle.GetSize().x - 10, (App.GetView().GetRect().GetHeight() - RightPaddle.GetSize().y) / 2);
	Ball.Move((App.GetView().GetRect().GetWidth() - Ball.GetSize().x) / 2, (App.GetView().GetRect().GetHeight() - Ball.GetSize().y) / 2);

	// Define the paddles properties
	var AITimer = new sfml.Clock();
	var AITime     = 0.1;
	var LeftPaddleSpeed  = 400.0;
	var RightPaddleSpeed = 400.0;

/*
	// Define the ball properties
	var BallSpeed = 400.0;
	var BallAngle;
	do
	{
		// Make sure the ball initial angle is not too much vertical
		BallAngle = sfml.Randomizer::Random(0.0, 2 * MyPai);
	} while (std::abs(std::cos(BallAngle)) < 0.7);

	bool IsPlaying = true;
	while (App.IsOpened())
	{
		// Handle events
		sfml.Event Event;
		while (App.GetEvent(Event))
		{
			// Window closed or escape key pressed : exit
			if ((Event.Type == sfml.Event::Closed) || 
			   ((Event.Type == sfml.Event::KeyPressed) && (Event.Key.Code == sfml.Key::Escape)))
			{
				App.Close();
				break;
			}
		}

		if (IsPlaying)
		{
			// Move the player's paddle
			if (App.GetInput().IsKeyDown(sfml.Key::Up) && (LeftPaddle.GetPosition().y > 5.f))
				LeftPaddle.Move(0.f, -LeftPaddleSpeed * App.GetFrameTime());
			if (App.GetInput().IsKeyDown(sfml.Key::Down) && (LeftPaddle.GetPosition().y < App.GetView().GetRect().GetHeight() - LeftPaddle.GetSize().y - 5.f))
				LeftPaddle.Move(0.f, LeftPaddleSpeed * App.GetFrameTime());

			// Move the computer's paddle
			if (((RightPaddleSpeed < 0.f) && (RightPaddle.GetPosition().y > 5.f)) ||
				((RightPaddleSpeed > 0.f) && (RightPaddle.GetPosition().y < App.GetView().GetRect().GetHeight() - RightPaddle.GetSize().y - 5.f)))
			{
				RightPaddle.Move(0.f, RightPaddleSpeed * App.GetFrameTime());
			}

			// Update the computer's paddle direction according to the ball position
			if (AITimer.GetElapsedTime() > AITime)
			{
				AITimer.Reset();
				if ((RightPaddleSpeed < 0) && (Ball.GetPosition().y + Ball.GetSize().y > RightPaddle.GetPosition().y + RightPaddle.GetSize().y))
					RightPaddleSpeed = -RightPaddleSpeed;
				if ((RightPaddleSpeed > 0) && (Ball.GetPosition().y < RightPaddle.GetPosition().y))
					RightPaddleSpeed = -RightPaddleSpeed;
			}

			// Move the ball
			float Factor = BallSpeed * App.GetFrameTime();
			Ball.Move(std::cos(BallAngle) * Factor, std::sin(BallAngle) * Factor);

			// Check collisions between the ball and the screen
			if (Ball.GetPosition().x < 0.f)
			{
				IsPlaying = false;
				End.SetText("You lost !\n(press escape to exit)");
			}
			if (Ball.GetPosition().x + Ball.GetSize().x > App.GetView().GetRect().GetWidth())
			{
				IsPlaying = false;
				End.SetText("You won !\n(press escape to exit)");
			}
			if (Ball.GetPosition().y < 0.f)
			{
				BallSound.Play();
				BallAngle = -BallAngle;
				Ball.SetY(0.1f);
			}
			if (Ball.GetPosition().y + Ball.GetSize().y > App.GetView().GetRect().GetHeight())
			{
				BallSound.Play();
				BallAngle = -BallAngle;
				Ball.SetY(App.GetView().GetRect().GetHeight() - Ball.GetSize().y - 0.1f);
			}

			// Check the collisions between the ball and the paddles
			// Left Paddle
			if (Ball.GetPosition().x < LeftPaddle.GetPosition().x + LeftPaddle.GetSize().x && 
				Ball.GetPosition().x > LeftPaddle.GetPosition().x + (LeftPaddle.GetSize().x / 2.0f) &&
				Ball.GetPosition().y + Ball.GetSize().y >= LeftPaddle.GetPosition().y &&
				Ball.GetPosition().y <= LeftPaddle.GetPosition().y + LeftPaddle.GetSize().y)
			{
				BallSound.Play();
				BallAngle = MyPai - BallAngle;
				Ball.SetX(LeftPaddle.GetPosition().x + LeftPaddle.GetSize().x + 0.1f);
			}

			// Right Paddle
			if (Ball.GetPosition().x + Ball.GetSize().x > RightPaddle.GetPosition().x &&
				Ball.GetPosition().x + Ball.GetSize().x < RightPaddle.GetPosition().x + (RightPaddle.GetSize().x / 2.0f) &&
				Ball.GetPosition().y + Ball.GetSize().y >= RightPaddle.GetPosition().y &&
				Ball.GetPosition().y <= RightPaddle.GetPosition().y + RightPaddle.GetSize().y)
			{
				BallSound.Play();
				BallAngle = MyPai - BallAngle;
				Ball.SetX(RightPaddle.GetPosition().x - Ball.GetSize().x - 0.1f);
			}
		}

		// Clear the window
		App.Clear();

		// Draw the background, paddles and ball sprites
		App.Draw(Background);
		App.Draw(LeftPaddle);
		App.Draw(RightPaddle);
		App.Draw(Ball);

		// If the game is over, display the end message
		if (!IsPlaying)
			App.Draw(End);

		// Display things on screen
		App.Display();
	}

	*/
}


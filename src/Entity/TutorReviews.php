<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * TutorSession
 *
 * @ORM\Table(name="Tutoring.Tutor_Reviews", uniqueConstraints={@ORM\UniqueConstraint(name="Review_ID_UNIQUE", columns={"Review_ID"})},
 * indexes={@ORM\Index(name="fk_Tutor_Reviews_Tutee_Table1_idx", columns={"Tutee_ID"}), @ORM\Index(name="fk_Tutor_Reviews_Tutor_Table1_idx", columns={"Tutor_ID"})})
 * @ORM\Entity
 */
class TutorReviews
{

    /**
     * @var integer
     *
     * @ORM\Column(name="Review_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
    */
    private $revId;

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\UserTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Tutor_ID", referencedColumnName="User_ID")
     * })
     */
    private $tutorId;

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\UserTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Tutee_ID", referencedColumnName="User_ID")
     * })
     */
    private $tuteeId;

    /**
     * @var string
     *
     * @ORM\Column(name="Comment", type="string", length=200)
    */
    private $comment;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Submission_Time", type="datetime")
    */
    private $subTime;

    /**
     * @var float
     *
     * @ORM\Column(name="Attitude", type="decimal", scale=4, precision=5)
    */
    private $attitude;

    /**
     * @var float
     *
     * @ORM\Column(name="Understanding", type="decimal", scale=4, precision=5)
    */
    private $understanding;

    /**
     * @var float
     *
     * @ORM\Column(name="Usefulness", type="decimal", scale=4, precision=5)
    */
    private $usefulness;

    /**
     * Get revId
     *
     * @return integer
     */
    public function getRevId()
    {
        return $this->revId;
    }

    /**
     * Set comment
     *
     * @param string $comment
     *
     * @return TutorReviews
     */
    public function setComment($comment)
    {
        $this->comment = $comment;

        return $this;
    }

    /**
     * Get comment
     *
     * @return string
     */
    public function getComment()
    {
        return $this->comment;
    }

    /**
     * Set subTime
     *
     * @param \DateTime $subTime
     *
     * @return TutorReviews
     */
    public function setSubTime($subTime)
    {
        $this->subTime = $subTime;

        return $this;
    }

    /**
     * Get subTime
     *
     * @return \DateTime
     */
    public function getSubTime()
    {
        return $this->subTime;
    }

    /**
     * Set attitude
     *
     * @param string $attitude
     *
     * @return TutorReviews
     */
    public function setAttitude($attitude)
    {
        $this->attitude = $attitude;

        return $this;
    }

    /**
     * Get attitude
     *
     * @return string
     */
    public function getAttitude()
    {
        return $this->attitude;
    }

    /**
     * Set understanding
     *
     * @param string $understanding
     *
     * @return TutorReviews
     */
    public function setUnderstanding($understanding)
    {
        $this->understanding = $understanding;

        return $this;
    }

    /**
     * Get understanding
     *
     * @return string
     */
    public function getUnderstanding()
    {
        return $this->understanding;
    }

    /**
     * Set usefulness
     *
     * @param string $usefulness
     *
     * @return TutorReviews
     */
    public function setUsefulness($usefulness)
    {
        $this->usefulness = $usefulness;

        return $this;
    }

    /**
     * Get usefulness
     *
     * @return string
     */
    public function getUsefulness()
    {
        return $this->usefulness;
    }

    /**
     * Set tutorId
     *
     * @param \App\Entity\UserTable $tutorId
     *
     * @return TutorReviews
     */
    public function setTutorId(\App\Entity\UserTable $tutorId = null)
    {
        $this->tutorId = $tutorId;

        return $this;
    }

    /**
     * Get tutorId
     *
     * @return \App\Entity\UserTable
     */
    public function getTutorId()
    {
        return $this->tutorId;
    }

    /**
     * Set tuteeId
     *
     * @param \App\Entity\UserTable $tuteeId
     *
     * @return TutorReviews
     */
    public function setTuteeId(\App\Entity\UserTable $tuteeId = null)
    {
        $this->tuteeId = $tuteeId;

        return $this;
    }

    /**
     * Get tuteeId
     *
     * @return \AppBundle\Entity\UserTable
     */
    public function getTuteeId()
    {
        return $this->tuteeId;
    }
}

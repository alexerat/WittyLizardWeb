<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * TutorCurriculum
 *
 * @ORM\Table(name="Tutoring.Tutor_Curriculum",
 * indexes={@ORM\Index(name="fk_Tutor_Curriculum_Curriculum_Table1_idx", columns={"Curriculum_ID"}), @ORM\Index(name="fk_Tutor_Curriculum_Language_Table1_idx", columns={"Language_ID"}), @ORM\Index(name="fk_Tutor_Curriculum_Tutor_Table1_idx", columns={"Tutor_ID"})})
 * @ORM\Entity
 */
class TutorCurriculum
{
    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\UserTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Tutor_ID", referencedColumnName="User_ID")
     * })
     */
    private $tutor;

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\CurriculumTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Curriculum_ID", referencedColumnName="Curriculum_ID")
     * })
     */
    private $curr;


    /**
     * @var float
     *
     * @ORM\Column(name="Value", type="decimal", scale=4, precision=10)
    */
    private $val;

    /**
     * @var string
     *
     * @ORM\Column(name="Currency", type="string", length=4)
    */
    private $currency;

    /**
     * @var \App\Entity\LanguageTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\LanguageTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Language_ID", referencedColumnName="Language_ID")
     * })
     */
    private $language;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Submission_Date", type="datetime")
    */
    private $submission;

    /**
     * Set val
     *
     * @param string $val
     *
     * @return TutorCurriculum
     */
    public function setVal($val)
    {
        $this->val = $val;

        return $this;
    }

    /**
     * Get val
     *
     * @return string
     */
    public function getVal()
    {
        return $this->val;
    }

    /**
     * Set currency
     *
     * @param string $currency
     *
     * @return TutorCurriculum
     */
    public function setCurrency($currency)
    {
        $this->currency = $currency;

        return $this;
    }

    /**
     * Get currency
     *
     * @return string
     */
    public function getCurrency()
    {
        return $this->currency;
    }

    /**
     * Set submission
     *
     * @param \DateTime $submission
     *
     * @return TutorCurriculum
     */
    public function setSubmission($submission)
    {
        $this->submission = $submission;

        return $this;
    }

    /**
     * Get submission
     *
     * @return \DateTime
     */
    public function getSubmission()
    {
        return $this->submission;
    }

    /**
     * Set tutor
     *
     * @param \App\Entity\UserTable $tutor
     *
     * @return TutorCurriculum
     */
    public function setTutor(\App\Entity\UserTable $tutor = null)
    {
        $this->tutor = $tutor;

        return $this;
    }

    /**
     * Get tutor
     *
     * @return \App\Entity\UserTable
     */
    public function getTutor()
    {
        return $this->tutor;
    }

    /**
     * Set curr
     *
     * @param \App\Entity\CurriculumTable $curr
     *
     * @return TutorCurriculum
     */
    public function setCurr(\App\Entity\CurriculumTable $curr = null)
    {
        $this->curr = $curr;

        return $this;
    }

    /**
     * Get curr
     *
     * @return \App\Entity\CurriculumTable
     */
    public function getCurr()
    {
        return $this->curr;
    }

    /**
     * Set language
     *
     * @param \App\Entity\LanguageTable $language
     *
     * @return TutorCurriculum
     */
    public function setLanguage(\App\Entity\LanguageTable $language = null)
    {
        $this->language = $language;

        return $this;
    }

    /**
     * Get language
     *
     * @return \App\Entity\LanguageTable
     */
    public function getLanguage()
    {
        return $this->language;
    }
}
